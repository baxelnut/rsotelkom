declare module "react-toggle-dark-mode" {
  import type { FC } from "react";

  interface DarkModeSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: number;
    moonColor?: string;
    sunColor?: string;
    animationDuration?: number;
    className?: string;
    disabled?: boolean;
  }

  export const DarkModeSwitch: FC<DarkModeSwitchProps>;
}
