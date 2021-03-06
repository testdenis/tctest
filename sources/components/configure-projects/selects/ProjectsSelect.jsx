/* globals document */

import React from 'react';
import PropTypes from 'prop-types';
import { Set } from 'immutable';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import List from 'react-virtualized/dist/commonjs/List';
import ArrowKeyStepper from 'react-virtualized/dist/commonjs/ArrowKeyStepper';

import keyCodes from '../../../utils/keyCodes';
import ProjectsSelectOption from './ProjectsSelectOption';
import './projects-select.scss';

const OPTION_HEIGHT = 26;

class ProjectsSelect extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedIds: PropTypes.instanceOf(Set).isRequired,
    firstChangedIndex: PropTypes.number,
    noScrollList: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func,
    optionActionText: PropTypes.string,
    optionActionOnClick: PropTypes.func,
  };

  static defaultProps = {
    firstChangedIndex: undefined,
    onKeyDown: undefined,
    optionActionText: undefined,
    optionActionOnClick: undefined,
  };

  componentDidMount() {
    document.addEventListener('mouseup', this.onGlobalMouseUp);
  }

  componentWillUpdate(nextProps) {
    const items = this.props.items;
    const nextItems = nextProps.items;

    if (items.length === nextItems.length
      && (items !== nextItems || this.props.selectedIds !== nextProps.selectedIds)) {
      this.scrollToAlignment = 'auto';
      this.listRef.forceUpdateGrid();
    }

    if (nextProps.firstChangedIndex !== null
      && nextProps.firstChangedIndex !== this.props.firstChangedIndex) {
      this.activeSelectStartIndex = nextProps.firstChangedIndex;
      this.activeSelectEndIndex = nextProps.firstChangedIndex;
      this.scrollToAlignment = 'center';
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onGlobalMouseUp);
  }

  onItemMouseDown = (id, index, event) => {
    this.mouseDown = true;

    if (event.ctrlKey || event.metaKey) {
      const { selectedIds } = this.props;

      this.savedSelectedIds = selectedIds;
      this.activeSelectStartIndex = index;
      this.activeSelectEndIndex = index;
      this.currentActionIsDeselect = selectedIds.has(id);

      this.updateSelectedIds();
    } else if (event.shiftKey) {
      this.savedSelectedIds = new Set();
      this.activeSelectStartIndex = this.activeSelectStartIndex !== null
        ? this.activeSelectStartIndex : index;
      this.activeSelectEndIndex = index;
      this.currentActionIsDeselect = false;

      this.updateSelectedIds();
    } else {
      this.savedSelectedIds = new Set();
      this.activeSelectStartIndex = index;
      this.activeSelectEndIndex = index;
      this.currentActionIsDeselect = false;

      this.updateSelectedIds();
    }
  };

  onItemMouseEnter = (id, index) => {
    if (this.mouseDown) {
      this.activeSelectEndIndex = index;
      this.updateSelectedIds();
    }
  };

  onGlobalMouseUp = () => {
    if (this.mouseDown) {
      this.mouseDown = false;
    }
  };

  onKeyDown = (event) => {
    const itemsCount = this.props.items.length;
    if (itemsCount === 0) {
      return;
    }

    switch (event.keyCode) {
      case keyCodes.downArrow:
        event.preventDefault();
        this.handleDownButton(event.shiftKey);
        break;

      case keyCodes.upArrow:
        event.preventDefault();
        this.handleUpButton(event.shiftKey);
        break;

      case keyCodes.a:
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();

          this.savedSelectedIds = this.props.selectedIds;
          this.activeSelectStartIndex = itemsCount - 1;
          this.activeSelectEndIndex = 0;
          this.currentActionIsDeselect = false;

          this.updateSelectedIds();
        }
        break;

      default:
        break;
    }

    const { onKeyDown } = this.props;
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  getSelectedIdsForUpdate() {
    if (this.activeSelectStartIndex === null || this.activeSelectEndIndex === null) {
      return new Set();
    }

    const { items } = this.props;
    const ids = [];

    const indexes = this.getSortedActiveSelectIndexes();

    let index = indexes.firstIndex;
    let item;
    while (index <= indexes.lastIndex) {
      item = items[index];
      if (!item.disabled) {
        ids.push(items[index].id);
      }
      index += 1;
    }

    return this.currentActionIsDeselect
      ? this.savedSelectedIds.subtract(ids)
      : this.savedSelectedIds.union(ids);
  }

  getSortedActiveSelectIndexes = () => (
    this.activeSelectStartIndex < this.activeSelectEndIndex ? {
      firstIndex: this.activeSelectStartIndex,
      lastIndex: this.activeSelectEndIndex,
    } : {
      firstIndex: this.activeSelectEndIndex,
      lastIndex: this.activeSelectStartIndex,
    }
  );

  setListRef = (ref) => {
    this.listRef = ref;
  };

  handleDownButton(shiftPressed) {
    let startIndex;
    let endIndex;

    if (this.activeSelectStartIndex === null) {
      endIndex = 0;
      startIndex = endIndex;
    } else {
      const { items } = this.props;
      const itemsCount = items.length;

      let needNext = true;
      endIndex = this.activeSelectEndIndex;

      while (needNext) {
        if (endIndex === itemsCount - 1) {
          needNext = false;
          endIndex = this.activeSelectEndIndex;
        } else {
          endIndex += 1;
          if (!items[endIndex].disabled) {
            needNext = false;
          }
        }
      }

      if (shiftPressed) {
        startIndex = this.activeSelectStartIndex;
      } else {
        startIndex = endIndex;
      }
    }

    this.activeSelectStartIndex = startIndex;
    this.activeSelectEndIndex = endIndex;
    this.currentActionIsDeselect = false;
    this.savedSelectedIds = shiftPressed ? this.savedSelectedIds : new Set();

    this.updateSelectedIds();
  }

  handleUpButton(shiftPressed) {
    const { items } = this.props;
    const itemsCount = items.length;

    let startIndex;
    let endIndex;

    if (this.activeSelectStartIndex === null) {
      endIndex = itemsCount - 1;
      startIndex = endIndex;
    } else {
      let needPrev = true;
      endIndex = this.activeSelectEndIndex;

      while (needPrev) {
        if (endIndex === 0) {
          needPrev = false;
          endIndex = this.activeSelectEndIndex;
        } else {
          endIndex -= 1;
          if (!items[endIndex].disabled) {
            needPrev = false;
          }
        }
      }

      if (shiftPressed) {
        startIndex = this.activeSelectStartIndex;
      } else {
        startIndex = endIndex;
      }
    }

    this.activeSelectStartIndex = startIndex;
    this.activeSelectEndIndex = endIndex;
    this.currentActionIsDeselect = false;
    this.savedSelectedIds = shiftPressed ? this.savedSelectedIds : new Set();

    this.updateSelectedIds();
  }

  updateSelectedIds() {
    this.props.onChange(this.getSelectedIdsForUpdate());
  }

  optionRenderer = ({ index, style }) => {
    const { items, selectedIds, optionActionText, optionActionOnClick } = this.props;
    const item = items[index];

    return (
      <ProjectsSelectOption
        key={item.id}
        id={item.id}
        index={index}
        name={item.name}
        depth={item.depth}
        parentCustomSort={item.parentCustomSort}
        disabled={item.disabled}
        filterMatch={item.filterMatch}
        selected={selectedIds.has(item.id)}
        actionText={optionActionText}
        actionOnClick={optionActionOnClick}
        onMouseDown={this.onItemMouseDown}
        onMouseEnter={this.onItemMouseEnter}
        style={style}
      />
    );
  };

  savedSelectedIds = new Set();
  activeSelectStartIndex = null;
  activeSelectEndIndex = null;
  currentActionIsDeselect = false;
  mouseDown = false;

  scrollToAlignment = 'auto';

  render() {
    const { items, noScrollList } = this.props;
    const rowCount = items.length;

    return (
      // No need focus for this element because <List /> already have it.
      // Unfortunately <List /> component doesn't have onKeyDown property.
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className="projects-select"
        onKeyDown={this.onKeyDown}
      >
        <ArrowKeyStepper
          className="projects-select__arrow-key-stepper"
          mode="cells"
          columnCount={1}
          rowCount={rowCount}
          scrollToRow={this.activeSelectEndIndex !== null ? this.activeSelectEndIndex : -1}
          isControlled
        >
          {({ onSectionRendered, scrollToRow }) => (
            <AutoSizer>
              {({ height, width }) => (
                <List
                  className="projects-select__list"
                  width={width}
                  height={height}
                  rowCount={rowCount}
                  rowHeight={OPTION_HEIGHT}
                  rowRenderer={this.optionRenderer}
                  onSectionRendered={onSectionRendered}
                  scrollToIndex={noScrollList ? -1 : scrollToRow}
                  scrollToAlignment={this.scrollToAlignment}
                  ref={this.setListRef}
                />
              )}
            </AutoSizer>
          )}
        </ArrowKeyStepper>
      </div>
    );
  }
}

export default ProjectsSelect;
