import React, { useState, useEffect, useCallback, useMemo } from "react";
import cx from "classnames";
import { Collapsible } from "./Collapsible";
import { CategoryHeading } from "./CategoryHeading";
import SimpleBar from "simplebar-react";

export function SelectPanel({ panels, selectedPanel, onSelectPanel, onScroll }) {
  return (
    <div className="panel-selector">
      <SimpleBar className="simpleBar" style={{ height: "100%" }} scrollableNodeProps={{ onScroll }}>
        {panels.map(({ title, panel, disabled }) => (
          <div className={cx("panel", { collapsed: selectedPanel !== title, disabled })} key={title}>
            <CategoryHeading
              {...{
                categoryName: title,
                selectedPartName: "",
                image: undefined,
                isExpanded: selectedPanel === title,
                onClick: () => onSelectPanel(title),
                noImage: true,
              }}
            />
            <Collapsible>{panel}</Collapsible>
          </div>
        ))}
      </SimpleBar>
    </div>
  );
}
