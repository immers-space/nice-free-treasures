import React, { useState, useEffect, useCallback, useContext } from "react";
import constants from "../constants";
import { generateWave } from "../utils";
import { ToolbarContainer } from "./ToolbarContainer";
import { ButtonTip } from "./ButtonTip";
import { AvatarPreviewContainer } from "./AvatarPreviewContainer";
import { AvatarConfigurationPanel } from "./AvatarConfigurationPanel";
import { AvatarEditor } from "./AvatarEditor";
import { ModalClaimed } from "./ModalClaimed";
import { dispatch } from "../dispatch";
import { generateRandomConfig } from "../generate-random-config";
import initialAssets from "../assets";
import { isThumbnailMode } from "../utils";
import debounce from "../utils/debounce";
import { SelectPanel } from "./SelectPanel";
import { CategoryHeading } from "./CategoryHeading";
import { ClaimPanel } from "./ClaimPanel";
import { IntroPanel } from "./IntroPanel";
import { useStore } from "../store";
import { getShopKeepActivities, immersClient } from "../utils/immers";
import { Activities, ImmersClient } from "immers-client";

// Used externally by the generate-thumbnails script
const thumbnailMode = isThumbnailMode();

export function AvatarEditorContainer() {
  const [assets, setAssets] = useState(initialAssets);
  const [hoveredConfig, setHoveredConfig] = useState({});
  const debouncedSetHoveredConfig = useCallback(debounce(setHoveredConfig), [setHoveredConfig]);
  const [canvasUrl, setCanvasUrl] = useState(null);
  const [claimStatus, setClaimStatus] = useState("");
  const [compat, setCompat] = useState("");
  const [nftUrl, setNftUrl] = useState("");

  const initialConfig = generateRandomConfig(assets);
  const [avatarConfig, setAvatarConfig] = useState(initialConfig);
  const [tipState, setTipState] = useState({ visible: false, text: "", top: 0, left: 0 });

  const selectedPanel = useStore(useCallback((state) => state.selectedPanel));
  const setSelectedPanel = useStore(useCallback((state) => state.setSelectedPanel));

  const isTreasureOpen = useStore(useCallback((state) => state.isTreasureOpen));
  const closeTreasure = useStore(useCallback((state) => state.closeTreasure));
  const thumbnailBlob = useStore(useCallback((state) => state.thumbnailBlob));
  const avatarBlob = useStore(useCallback((state) => state.avatarBlob));
  const profile = useStore(useCallback((state) => state.profile));

  useEffect(() => {
    if (!thumbnailMode) {
      dispatch(constants.avatarConfigChanged, { avatarConfig: { ...avatarConfig, ...hoveredConfig } });
    }
    dispatch(constants.reactIsLoaded);
  });

  // TODO: Save the wave to a static image, or actually do some interesting animation with it.
  useEffect(async () => {
    if (canvasUrl === null) {
      setCanvasUrl(await generateWave());
    }
  });

  // Reset when returning to into panel
  useEffect(() => {
    if (!isTreasureOpen) {
      randomizeConfig();
    }
  }, [isTreasureOpen]);

  useEffect(async () => {
    if (!thumbnailBlob || !avatarBlob) {
      return;
    }
    try {
      const shopKeepActivities = await getShopKeepActivities();
      // upload avatar/thumbnail and post Create activity with new Model
      const treasureIRI = await shopKeepActivities.model(
        `${profile.displayName}'s Nice Free Treasure`,
        avatarBlob,
        thumbnailBlob,
        [],
        "public"
      );
      setClaimStatus("created");
      if (compat === "WebCollectibles") {
        const offerIRI = await window
          .fetch(`/claim-treasure`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requestorId: profile.id,
              createdId: treasureIRI,
            }),
          })
          .then((result) => {
            if (!result.ok) {
              throw new Error(`Error offering avatar: ${result.status}`);
            }
            return result.headers.get("Location");
          });
        setClaimStatus("shared");
        setNftUrl(offerIRI);
      } else if (compat === "ActivityPub") {
        const postIRI = await window
          .fetch(`/share-treasure`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requestorId: profile.id,
              createdId: treasureIRI,
            }),
          })
          .then((result) => {
            if (!result.ok) {
              throw new Error(`Error sharing avatar: ${result.status}`);
            }
            return result.headers.get("Location");
          });
        setClaimStatus("shared");
        setNftUrl(treasureIRI);
      } else {
        setClaimStatus("shared");
        setNftUrl(treasureIRI);
      }
    } catch (err) {
      console.error(err);
      setClaimStatus("");
    }
  }, [thumbnailBlob, avatarBlob]);

  function updateAvatarConfig(newConfig) {
    setAvatarConfig({ ...avatarConfig, ...newConfig });
  }

  function showTip(text, top, left) {
    setTipState({ visible: true, text, top, left });
  }

  function hideTip() {
    setTipState({ visible: false });
  }

  function capitalize(str) {
    if (!str) return "";
    return str[0].toUpperCase() + str.substring(1);
  }

  // TODO Share this code with the generate-assets script.
  function parseFilename(fullname, categoryNamePrefix, fallbackCategoryName) {
    const filename = fullname.substring(0, fullname.lastIndexOf("."));

    let [hyphenatedCategory, hyphenatedName] = filename.split("_");
    if (!hyphenatedName) {
      hyphenatedCategory = fallbackCategoryName;
      hyphenatedName = filename;
    } else {
      hyphenatedCategory = categoryNamePrefix + "-" + hyphenatedCategory;
    }
    const category = hyphenatedCategory
      .split("-")
      .map((p) => capitalize(p))
      .join(" ");
    const displayName = hyphenatedName
      .split("-")
      .map((p) => capitalize(p))
      .join(" ");
    return [category, displayName];
  }

  function onGLBUploaded(e) {
    const file = e.target.files[0];

    let [category, displayName] = parseFilename(file.name, "Uploaded", "Uploads");
    const url = URL.createObjectURL(file);

    const clone = { ...assets };

    clone[category] = clone[category] || {
      parts: [
        {
          displayName: "None",
          value: null,
        },
      ],
    };

    clone[category].parts.push({
      displayName,
      value: url,
    });

    setAssets(clone);

    updateAvatarConfig({ [category]: url });
  }

  function randomizeConfig() {
    setAvatarConfig(generateRandomConfig(assets));
  }

  function onClaimAvatar() {
    dispatch(constants.exportAvatar);
    setClaimStatus("processing");
  }

  const panels = [
    {
      title: "Open",
      panel: <IntroPanel />,
      disabled: false,
    },
    {
      title: "Customize",
      panel: (
        <AvatarConfigurationPanel
          {...{
            avatarConfig,
            assets,
            onSelectAvatarPart: ({ categoryName, part }) => {
              updateAvatarConfig({ [categoryName]: part.value });
            },
            onHoverAvatarPart: ({ categoryName, part, tip, rect }) => {
              debouncedSetHoveredConfig({ [categoryName]: part.value });
              showTip(tip, rect.bottom, rect.left + rect.width / 2);
            },
            onUnhoverAvatarPart: () => {
              debouncedSetHoveredConfig({});
              hideTip();
            },
          }}
        />
      ),
      disabled: !isTreasureOpen,
    },
    {
      title: "Claim",
      panel: <ClaimPanel {...{ onClaimAvatar, claimStatus, compat, setCompat }} />,
      disabled: !isTreasureOpen,
    },
  ];

  const onSelectPanel = useCallback((panel) => {
    if (panel === "Open") {
      closeTreasure();
      dispatch(constants.resetView);
    } else {
      setSelectedPanel(panel);
    }
  });

  return (
    <AvatarEditor
      {...{
        thumbnailMode,
        leftPanel: <SelectPanel {...{ panels, selectedPanel, onSelectPanel, onScroll: hideTip }} />,
        rightPanel: <AvatarPreviewContainer {...{ thumbnailMode, canvasUrl }} />,
        buttonTip: <ButtonTip {...tipState} />,
        toolbar: <ToolbarContainer {...{ onGLBUploaded, randomizeConfig }} />,
        modal: <ModalClaimed {...{ nftUrl, compat }} />,
      }}
    />
  );
}
