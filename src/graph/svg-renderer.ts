import { getDotSelector } from './dot';
import { observeStore } from '../redux';
import { svgRenderingFinished, reportError } from '../actions';

import { loadWorker as defaultLoadWorker } from '../utils/';
import { WorkerCallback } from '../utils/types';

import Viz from 'viz.js';
import defaultWorkerURI from 'viz.js/full.render.js';

export class SVGRender {
  unsubscribe: any;
  viz: any;

  constructor(
    public store,
    workerURI: string = defaultWorkerURI,
    loadWorker: WorkerCallback = defaultLoadWorker,
  ) {
    loadWorker(workerURI || defaultWorkerURI, !workerURI).then(worker => {
      this.viz = new Viz({ worker });

      this.unsubscribe = observeStore(store, getDotSelector, dot => {
        if (dot !== null) this._renderSvg(dot);
      });
    });
  }

  destroy() {
    this.unsubscribe();
  }

  _renderSvg(dot) {
    console.time('Rendering Graph');
    this.viz
      .renderString(dot)
      .then(svg => {
        this.store.dispatch(svgRenderingFinished(svg));
        console.timeEnd('Rendering Graph');
      })
      .catch(error => {
        const msg = error.message || 'Unknown error';
        this.store.dispatch(reportError(msg));
      });
  }
}
