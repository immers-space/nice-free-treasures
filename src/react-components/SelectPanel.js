import React, { useState, useEffect, useCallback } from "react";
import cx from "classnames";
import { Collapsible } from "./Collapsible";
import { CategoryHeading } from "./CategoryHeading";


export function SelectPanel({ panels, selectedPanel, onSelectPanel }) {
  return (
    <div className="panel-selector">
      {panels.map(({title, panel, disabled}) =>
        <div className={cx("panel", { collapsed: selectedPanel !== title, disabled })} key={title}>
          <CategoryHeading
            {...{
              categoryName: title,
              selectedPartName: "",
              image: undefined,
              isExpanded: selectedPanel === title,
              onClick: () => onSelectPanel(title),
              noImage: true
            }}
          />
          <Collapsible>
            { panel }
          </Collapsible>
        </div>
      )}
    </div>
  );
}
