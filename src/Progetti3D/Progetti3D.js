import React from "react";
import ProjectGrid from "../components/ProjectGrid/ProjectGrid";

const avatar = process.env.PUBLIC_URL + "/semoy.jpg";

function Progetti3DSection(props) {
  return <ProjectGrid {...props} category="3d" />;
}

export const section = {
  key: "PROGETTI 3D",
  label: "PROGETTI 3D",
  avatar,
  render: Progetti3DSection,
  fullWidth: true,
};
