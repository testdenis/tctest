import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { loadProjects, hideProjects, showProjects } from '../../actions/ConfigureProjectsActions';

import ArrowButton, { directions as arrowButtonDiractions } from '../arrow-button/ArrowButton';
import ProjectsSelect from './project-select/ProjectsSelect';

import './configure-projects.scss';
import '../centered-block/centered-block.scss';

export class ConfigureProjects extends React.Component {
  static propTypes = {
    configureProjects: PropTypes.instanceOf(Map).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  state = {
    anyVisibleSelected: false,
    anyHiddenSelected: false,
  };

  componentDidMount() {
    this.props.dispatch(loadProjects());
  }

  onVisibleSelectChange = (event) => {
    this.visibleOptions = event.target.options;

    const anyVisibleSelected = Boolean(event.target.options);
    if (anyVisibleSelected !== this.state.anyVisibleSelected) {
      this.setState({ anyVisibleSelected });
    }
  };

  onHiddenSelectChange = (event) => {
    this.hiddenOptions = event.target.options;

    const anyHiddenSelected = Boolean(event.target.options);
    if (anyHiddenSelected !== this.state.anyHiddenSelected) {
      this.setState({ anyHiddenSelected });
    }
  };

  onHideClick = () => {
    const selectedIds = this.getSelectedIds(this.visibleOptions, this.props.configureProjects.get('visible'));
    this.props.dispatch(hideProjects(selectedIds));
  };

  onShowClick = () => {
    const selectedIds = this.getSelectedIds(this.hiddenOptions, this.props.configureProjects.get('hidden'));
    this.props.dispatch(showProjects(selectedIds));
  };

  getSelectedIds = (options, items) => {
    const reversedOptions = [...options].reverse();
    const selectedInfo = {};

    const setSelectedInfo = ({ id, selected, isAnyChildSelected }) => {
      let info = selectedInfo[id];
      if (!info) {
        info = {};
        selectedInfo[id] = info;
      }

      if (selected !== undefined) {
        info.selected = selected;
      }

      if (isAnyChildSelected !== undefined) {
        info.isAnyChildSelected = isAnyChildSelected;
      }
    };

    items.reverse().forEach((item, index) => {
      const id = item.get('id');
      const selected = reversedOptions[index].selected;
      setSelectedInfo({ id, selected });

      if (selected || selectedInfo[id].isAnyChildSelected) {
        setSelectedInfo({ id: item.get('parentId'), isAnyChildSelected: true });
      }
    });

    const selectedIds = [];
    items.forEach((item) => {
      const id = item.get('id');

      const info = selectedInfo[id];
      if (info && info.selected) {
        selectedIds.push(id);
      } else {
        const parentInfo = selectedInfo[item.get('parentId')];
        if (parentInfo && parentInfo.selected && !parentInfo.isAnyChildSelected) {
          selectedIds.push(item.get('id'));
          setSelectedInfo({ id, selected: true });
        }
      }
    });

    return selectedIds;
  };

  visibleOptions = [];
  hiddenOptions = [];

  render() {
    const { anyHiddenSelected, anyVisibleSelected } = this.state;
    const { configureProjects } = this.props;
    const visibleProjects = configureProjects.get('visible');
    const hiddenProjects = configureProjects.get('hidden');
    const error = configureProjects.get('error');

    return (
      <div className="configure-projects">
        {error && error.message}

        {configureProjects.get('loading') && <span>Loading...</span>}

        <div className="configure-projects__buttons centered-block">
          <div className="centered-block__content">
            <span className="configure-projects__button">
              <ArrowButton
                direction={arrowButtonDiractions.up}
                onClick={() => {}}
                disabled={!anyVisibleSelected}
              />
            </span>

            <span className="configure-projects__button">
              <ArrowButton
                direction={arrowButtonDiractions.down}
                onClick={() => {}}
                disabled={!anyHiddenSelected}
              />
            </span>
          </div>
        </div>

        <div className="configure-projects__items-wrapper">
          <div className="configure-projects__items-title">
            Visible projects
          </div>

          <div className="configure-projects__items">
            <ProjectsSelect
              items={visibleProjects}
              onChange={this.onVisibleSelectChange}
            />
          </div>
        </div>

        <div className="configure-projects__buttons centered-block">
          <div className="centered-block__content">
            <span className="configure-projects__button">
              <ArrowButton
                direction={arrowButtonDiractions.right}
                onClick={this.onHideClick}
                disabled={!anyVisibleSelected}
              />
            </span>

            <span className="configure-projects__button">
              <ArrowButton
                direction={arrowButtonDiractions.left}
                onClick={this.onShowClick}
                disabled={!anyHiddenSelected}
              />
            </span>
          </div>
        </div>

        <div className="configure-projects__items-wrapper">
          <div className="configure-projects__items-title">
            Hidden projects
          </div>

          <div className="configure-projects__items">
            <ProjectsSelect
              items={hiddenProjects}
              onChange={this.onHiddenSelectChange}
              disableVisibleItems
              showOriginalData
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  configureProjects: state.configureProjects,
}))(ConfigureProjects);
