import { ElementSizePosition, ClientPosition, IStyle } from '../../common/types';
import { constrainToRange } from '../../common/utils';

import { GlareProps, GlareSize } from './types';

export class Glare implements IStyle {
  public glareWrapperEl: HTMLDivElement;
  public glareEl: HTMLDivElement;

  public glareAngle = 0;
  public glareOpacity = 0;

  constructor(wrapperElSize: ElementSizePosition) {
    this.glareWrapperEl = document.createElement('div');
    this.glareEl = document.createElement('div');
    this.glareWrapperEl.appendChild(this.glareEl);
    this.glareWrapperEl.className = 'glare-wrapper';
    this.glareEl.className = 'glare';

    const styleGlareWrapper = {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      '-webkit-mask-image': '-webkit-radial-gradient(white, black)',
    };

    const glareSize = this.calculateGlareSize(wrapperElSize);
    const styleGlare = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      'transform-origin': '0% 0%',
      'pointer-events': 'none',
      width: `${glareSize.width}px`,
      height: `${glareSize.height}px`,
    };

    Object.assign(this.glareWrapperEl.style, styleGlareWrapper);
    Object.assign(this.glareEl.style, styleGlare);
  }

  private getBorderRadius = (props: GlareProps): GlareProps['glareBorderRadius'] => {
    const { glareBorderRadius } = props;
    return glareBorderRadius;
  };

  private calculateGlareSize = (wrapperElSize: ElementSizePosition): GlareSize => {
    const { width: w, height: h } = wrapperElSize;
    const wrapperElDiagonal = Math.sqrt(w! ** 2 + h! ** 2);
    return {
      width: wrapperElDiagonal,
      height: wrapperElDiagonal,
    };
  };

  public setSize = (wrapperElSize: ElementSizePosition): void => {
    const glareSize = this.calculateGlareSize(wrapperElSize);
    this.glareEl.style.width = `${glareSize.width}px`;
    this.glareEl.style.height = `${glareSize.height}px`;
  };

  public update = (
    wrapperElClientPosition: ClientPosition,
    props: GlareProps,
    flipVertically: boolean,
    flipHorizontally: boolean,
  ): void => {
    this.updateAngle(wrapperElClientPosition, props.glareReverse!);
    this.updateOpacity(wrapperElClientPosition, props, flipVertically, flipHorizontally);
  };

  private updateAngle = (wrapperElClientPosition: ClientPosition, glareReverse: boolean): void => {
    const { xPercentage, yPercentage } = wrapperElClientPosition;

    const rad2Deg = 180 / Math.PI;
    // top 0°, right +90°, bottom -+180°, left -90°
    const glareAngle = xPercentage ? Math.atan2(yPercentage, -xPercentage) * rad2Deg : 0;

    const addGlareAngle = glareReverse ? 180 : 0;
    this.glareAngle = glareAngle - addGlareAngle;
  };

  private updateOpacity = (
    wrapperElClientPosition: ClientPosition,
    props: GlareProps,
    flipVertically: boolean,
    flipHorizontally: boolean,
  ): void => {
    const { xPercentage, yPercentage } = wrapperElClientPosition;
    const { glarePosition, glareReverse, glareMaxOpacity } = props;

    const flipVerticallyFactor = flipVertically ? -1 : 1;
    const flipHorizontallyFactor = flipHorizontally ? -1 : 1;
    const glareReverseFactor = glareReverse ? -1 : 1;

    let glareOpacityFactor: number;
    switch (glarePosition) {
      case 'top':
        glareOpacityFactor = -xPercentage! * flipVerticallyFactor * glareReverseFactor;
        break;
      case 'right':
        glareOpacityFactor = yPercentage! * flipHorizontallyFactor * glareReverseFactor;
        break;
      case 'bottom':
        glareOpacityFactor = xPercentage! * flipVerticallyFactor * glareReverseFactor;
        break;
      case 'left':
        glareOpacityFactor = -yPercentage! * flipHorizontallyFactor * glareReverseFactor;
        break;
      case 'all':
        glareOpacityFactor = Math.hypot(xPercentage, yPercentage);
        break;
      default:
        glareOpacityFactor = xPercentage! * flipVerticallyFactor * glareReverseFactor;
    }

    const glareOpacityFactorRemoveNegative = constrainToRange(glareOpacityFactor, 0, 100);
    this.glareOpacity = (glareOpacityFactorRemoveNegative * glareMaxOpacity!) / 100;
  };

  public render = (props: GlareProps): void => {
    const { glareColor } = props;
    this.glareWrapperEl.style.borderRadius = this.getBorderRadius(props);
    this.glareEl.style.transform = `rotate(${this.glareAngle}deg) translate(-50%, -50%)`;
    this.glareEl.style.opacity = this.glareOpacity.toString();

    const linearGradient = `linear-gradient(0deg, rgba(255,255,255,0) 0%, ${glareColor} 100%)`;
    this.glareEl.style.background = linearGradient;
  };
}
