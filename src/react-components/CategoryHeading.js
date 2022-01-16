import React from "react";

import { Thumbnail } from "./Thumbnail";
import { Chevron } from "./Chevron";

export function CategoryHeading({ categoryName, onClick, isExpanded, selectedPartName, image, noImage }) {
  return (
    <div className="categoryHeading" onClick={onClick}>
      <h2 className="categoryName">{categoryName}</h2>
      <Chevron {...{ isExpanded }} />
      <h2 className="selectedPartName">{selectedPartName}</h2>
      {!noImage && <Thumbnail image={image} />}
    </div>
  );
}
