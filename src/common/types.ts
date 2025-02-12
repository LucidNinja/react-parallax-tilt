export type ElementSizePosition = {
  width: number | null;
  height: number | null;
  left: number | null;
  top: number | null;
};

export type ClientPosition = {
  x: number | null;
  y: number | null;
  xPercentage: number;
  yPercentage: number;
};

export interface IStyle {
  update: (
    wrapperElClientPosition: ClientPosition,
    props: any,
    flipVertically: boolean,
    flipHorizontally: boolean,
  ) => void;
}
