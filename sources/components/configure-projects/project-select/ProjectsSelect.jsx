import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { List } from 'immutable';

import './projects-select.scss';

export const types = {
  visible: 'visible',
  hidden: 'hidden',
};

function ProjectsSelect({ items, onChange, type }) {
  return (
    <select
      className="projects-select"
      onChange={onChange}
      multiple
    >
      {items.map((item) => {
        const classNames = cn(
          'projects-select__item',
          `projects-select__item_depth_${type === types.hidden ? item.get('originalDepth') : item.get('depth')}`,
          type === types.visible && item.get('parentCustomSort') && 'projects-select__item_custom-sort',
        );

        const name = type === types.hidden ? item.get('originalName') : item.get('name');

        return (
          <option
            key={item.get('id')}
            className={classNames}
            value={item.get('id')}
            disabled={type === types.hidden && item.get('visible')}
            title={name}
          >
            {name}
          </option>
        );
      })}
    </select>
  );
}

ProjectsSelect.propTypes = {
  type: PropTypes.oneOf([types.visible, types.hidden]).isRequired,
  items: PropTypes.instanceOf(List).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ProjectsSelect;

