import { AppToolbar } from './components/app-toolbar/app-toolbar';
import throttle from 'lodash/throttle';
import { DataSourceManager } from './model/datasource/manager';
import { SpanGroupingManager } from './model/span-grouping/manager';
import { SpanColoringManager } from './model/span-coloring-manager';
import { SpanLabellingManager } from './model/span-labelling-manager';
import { Trace } from './model/trace';
import { Stage, StageEvent } from './model/stage';
import {
  Timeline,
  TimelineEvent
} from './components/timeline/timeline';
import 'tippy.js/dist/tippy.css';

export interface AppOptions {
  element: HTMLDivElement;
}

export class App {
  private elements: {
    toolbar: HTMLDivElement;
  };

  private stage = Stage.getSingleton();
  private toolbar: AppToolbar;
  private timeline: Timeline;

  private binded = {
    onStageTraceAdded: this.onStageTraceAdded.bind(this),
    onStageTraceRemoved: this.onStageTraceRemoved.bind(this)
  };

  constructor(private options: AppOptions) {
    // Get dom references of required children components
    const toolbar = document.getElementById('app-toolbar') as HTMLDivElement;

    this.elements = {
      toolbar
    };

    for (let key in this.elements) {
      const el = this.elements[key];
      if (!el) throw new Error(`Expected child element: #${key}`);
    }

    // Create child components
    this.toolbar = new AppToolbar({
      element: toolbar
    });
    this.timeline = new Timeline();
  }

  async init() {
    // Init managers related with db
    await Promise.all([
      DataSourceManager.getSingleton().init(),
      SpanGroupingManager.getSingleton().init(),
      SpanColoringManager.getSingleton().init(),
      SpanLabellingManager.getSingleton().init()
    ]);

    // Bind stage event
    this.stage.on(StageEvent.TRACE_ADDED, this.binded.onStageTraceAdded);
    this.stage.on(StageEvent.TRACE_REMOVED, this.binded.onStageTraceRemoved);

    // Init timeline
    // this.elements.bodyRight.style.overflow = 'hidden'; // Fixes small scrolling
    // this.timeline.init(this.elements.bodyRight);
    // TODO: Bind TimelineViewEvent.SPANS_SELECTED
    // window.addEventListener('resize', this.throttled.autoResizeTimeline, false);

    await this.toolbar.init(); // Needs dsManager
  }

  onStageTraceAdded(trace: Trace) {
    this.timeline.addTrace(trace);
  }

  onStageTraceRemoved(trace: Trace) {
    this.timeline.removeTrace(trace);
  }

  dispose() {
    // window.removeEventListener(
    //   'resize',
    //   this.throttled.autoResizeTimeline,
    //   false
    // );

    this.toolbar.dispose();
    this.toolbar = null;
    this.timeline.dispose();
    this.timeline = null;
    this.elements = null;
    this.options = null;
  }
}
