import React from "react";
import ProjectGrid from "../components/ProjectGrid/ProjectGrid";

const avatar = process.env.PUBLIC_URL + "/semoy.jpg";

function GraficaSection(props) {
  return <ProjectGrid {...props} category="grafica" />;
}

export const section = {
  key: "GRAFICA",
  label: "GRAFICA",
  avatar,
  render: GraficaSection,
  fullWidth: true,
};
