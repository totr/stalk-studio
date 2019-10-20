import * as _ from 'lodash';
import BaseAnnotation from './base';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface IntervalHighlightAnnotationSettings {
  startTimestamp: number,
  finishTimestamp: number,
  lineColor?: string,
  lineWidth?: number,
  lineDashArray?: string,
  fillColor?: string
}
export default class IntervalHighlightAnnotation extends BaseAnnotation {
  private settings?: IntervalHighlightAnnotationSettings;
  private lineLeft = document.createElementNS(SVG_NS, 'line');
  private lineRight = document.createElementNS(SVG_NS, 'line');
  private rect = document.createElementNS(SVG_NS, 'rect');

  prepare(settings: IntervalHighlightAnnotationSettings) {
    this.settings = _.defaults(settings, {
      lineColor: '#000',
      lineWidth: 1,
      lineDashArray: 2,
      fillColor: 'transparent',
    });

    [this.lineLeft, this.lineRight].forEach((line) => {
      line.setAttribute('x1', '0');
      line.setAttribute('x2', '0');
      line.setAttribute('y1', '0');
      line.setAttribute('stroke', this.settings!.lineColor!);
      line.setAttribute('stroke-width', this.settings!.lineWidth! + '');
      line.setAttribute('stroke-dasharray', this.settings!.lineDashArray!);
    });

    this.rect.setAttribute('x', '0');
    this.rect.setAttribute('y', '0');
    this.rect.setAttribute('fill', this.settings.fillColor!);

    this.underlayElements = [ this.rect, this.lineLeft, this.lineRight ];
  }

  update() {
    if (!this.settings) return;
    if (!this.settings.startTimestamp || !this.settings.finishTimestamp) return;

    const height = Math.max(this.deps.timelineView.getContentHeight(), this.deps.viewSettings.height);
    this.rect.setAttribute('height', height + '');
    this.lineLeft.setAttribute('y2', height + '');
    this.lineRight.setAttribute('y2', height + '');

    const xStart = this.deps.viewSettings.getAxis().input2output(this.settings.startTimestamp);
    const xFinish = this.deps.viewSettings.getAxis().input2output(this.settings.finishTimestamp);

    this.rect.setAttribute('width', (xFinish - xStart) + '')
    this.rect.setAttribute('transform', `translate(${xStart}, 0)`);
    this.lineLeft.setAttribute('transform', `translate(${xStart}, 0)`);
    this.lineRight.setAttribute('transform', `translate(${xFinish}, 0)`);
  }
}
