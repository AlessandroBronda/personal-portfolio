import React from "react";
import ProjectGrid from "../components/ProjectGrid/ProjectGrid";

const avatar = process.env.PUBLIC_URL + "/semoy.jpg";

function AnimazioneSection(props) {
  return <ProjectGrid {...props} category="animazione" />;
}

export const section = {
  key: "ANIMAZIONE",
  label: "ANIMAZIONE",
  avatar,
  render: AnimazioneSection,
  fullWidth: true,
};
