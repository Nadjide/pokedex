import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import AdjustIcon from '@mui/icons-material/Adjust';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BoltIcon from '@mui/icons-material/Bolt';
import GrassIcon from '@mui/icons-material/Grass';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import ScienceIcon from '@mui/icons-material/Science';
import TerrainIcon from '@mui/icons-material/Terrain';
import AirIcon from '@mui/icons-material/Air';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BugReportIcon from '@mui/icons-material/BugReport';
import HexagonIcon from '@mui/icons-material/Hexagon';
import CycloneIcon from '@mui/icons-material/Cyclone';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// Material Icons n'a pas de fantôme : petit pictogramme maison.
const GhostIcon = (props) => (
  <SvgIcon {...props}>
    <path
      fillRule="evenodd"
      d="M12 2a7 7 0 0 0-7 7v12l2.33-2 2.34 2L12 19l2.33 2 2.34-2L19 21V9a7 7 0 0 0-7-7Zm-2.5 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
    />
  </SvgIcon>
);

const ICONS = {
  normal: AdjustIcon,
  fire: LocalFireDepartmentIcon,
  water: WaterDropIcon,
  electric: BoltIcon,
  grass: GrassIcon,
  ice: AcUnitIcon,
  fighting: SportsMmaIcon,
  poison: ScienceIcon,
  ground: TerrainIcon,
  flying: AirIcon,
  psychic: VisibilityIcon,
  bug: BugReportIcon,
  rock: HexagonIcon,
  ghost: GhostIcon,
  dragon: CycloneIcon,
  dark: DarkModeIcon,
  steel: SettingsIcon,
  fairy: AutoAwesomeIcon,
};

export default function TypeIcon({ type, ...props }) {
  const Icon = ICONS[type] || AdjustIcon;
  return <Icon aria-hidden="true" {...props} />;
}
