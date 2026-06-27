import React from "react";
import ProjectGrid from "../components/ProjectGrid/ProjectGrid";

const avatar = process.env.PUBLIC_URL + "/semoy.jpg";

function ProgrammazioneSection(props) {
  return <ProjectGrid {...props} category="programmazione" />;
}

export const section = {
  key: "PROGRAMMAZIONE",
  label: "PROGRAMMAZIONE",
  avatar,
  render: ProgrammazioneSection,
  fullWidth: true,
};
