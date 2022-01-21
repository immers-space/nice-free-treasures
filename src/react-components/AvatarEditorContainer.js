import React, { useState, useEffect, useCallback, useContext } from "react";
import constants from "../constants";
import { generateWave } from "../utils";
import { ToolbarContainer } from "./ToolbarContainer";
import { ButtonTip } from "./ButtonTip";
import { AvatarPreviewContainer } from "./AvatarPreviewContainer";
import { AvatarConfigurationPanel } from "./AvatarConfigurationPanel";
import { AvatarEditor } from "./AvatarEditor";
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

// Used externally by the generate-thumbnails script
const thumbnailMode = isThumbnailMode();

export function AvatarEditorContainer() {
  const [assets, setAssets] = useState(initialAssets);
  const [hoveredConfig, setHoveredConfig] = useState({});
  const debouncedSetHoveredConfig = useCallback(debounce(setHoveredConfig), [setHoveredConfig]);
  const [canvasUrl, setCanvasUrl] = useState(null);

  const initialConfig = generateRandomConfig(assets);
  const [avatarConfig, setAvatarConfig] = useState(initialConfig);
  const [tipState, setTipState] = useState({ visible: false, text: "", top: 0, left: 0 });

  const selectedPanel = useStore(useCallback(state => state.selectedPanel));
  const setSelectedPanel = useStore(useCallback(state => state.setSelectedPanel));

  const isTreasureOpen = useStore(useCallback(state => state.isTreasureOpen));
  const closeTreasure = useStore(useCallback(state => state.closeTreasure));

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
  }

  const panels = [
    {
      title: "Open",
      panel: <IntroPanel />,
      disabled: false
    },
    {
      title: "Claim",
      panel: <ClaimPanel {...{ onClaimAvatar }} />,
      disabled: !isTreasureOpen
    },
    {
      title: "Customize",
      panel: (
        <AvatarConfigurationPanel
          {...{
            avatarConfig,
            assets,
            onScroll: () => {
              hideTip();
            },
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
      disabled: !isTreasureOpen
    }
  ]

  const onSelectPanel = useCallback(panel => {
    if (panel === "Open") {
      closeTreasure();
    } else {
      setSelectedPanel(panel);
    }
  })

  return (
    <AvatarEditor
      {...{
        thumbnailMode,
        leftPanel: <SelectPanel {...{ panels, selectedPanel, onSelectPanel }} />,
        rightPanel: <AvatarPreviewContainer {...{ thumbnailMode, canvasUrl }} />,
        buttonTip: <ButtonTip {...tipState} />,
        toolbar: <ToolbarContainer {...{ onGLBUploaded, randomizeConfig }} />
      }}
    />
  );
}
