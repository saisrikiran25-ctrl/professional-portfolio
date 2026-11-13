import React from 'react';
import { Item, KIND_LABEL, rgb } from '../lib/items';

/**
 * The words on a project card, as real DOM text laid over the canvas art. Canvas text is
 * always a little soft; page text stays razor sharp at any zoom or screen density.
 * The canvas underneath carries only the gradients, dots and outlined number.
 */
const ArtText: React.FC<{ item: Item; /** leave room for an overlaid title pill */ pill?: boolean }> = ({ item, pill = true }) =>
  item.thumb ? null : (
  <div className={`arttext ${pill ? '' : 'arttext--free'}`} aria-hidden="true">
    <p className="arttext__kicker" style={{ color: rgb(item.color) }}>
      {(item.kicker ?? KIND_LABEL[item.kind]).toUpperCase()}
      <i>·</i>
      {String(item.n).padStart(2, '0')}
    </p>
    <div className="arttext__main">
      <h4 className="arttext__title">{item.title}</h4>
      <p className="arttext__meta">
        <span className="arttext__status">
          <i />
          {item.status}
        </span>
        {item.tags.length > 0 && <span className="arttext__tags">{item.tags.slice(0, 3).join('  ·  ')}</span>}
      </p>
    </div>
  </div>
);

export default ArtText;
