import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FormButton, {
  types as formButtonTypes,
  modifiers as formButtonModifiers,
} from '../../form-button/FormButton';

import './configure-projects-footer.scss';

export function ConfigureProjectsFooter({ onCancelClick, customSort }) {
  return (
    <div className="configure-projects-footer">
      <div className="configure-projects-footer__button">
        <FormButton
          text="Save"
          type={formButtonTypes.submit}
          modifier={formButtonModifiers.primary}
        />
      </div>

      <div className="configure-projects-footer__button">
        <FormButton
          text="Cancel"
          onClick={onCancelClick}
        />
      </div>

      {customSort &&
        <div className="configure-projects-footer__sort-message">
          Some projects are reordered (underlined)
        </div>
      }
    </div>
  );
}

ConfigureProjectsFooter.propTypes = {
  onCancelClick: PropTypes.func.isRequired,
  customSort: PropTypes.bool,
};

ConfigureProjectsFooter.defaultProps = {
  customSort: false,
};

const mapStateToProps = state => ({
  customSort: state.configureProjects.get('customSort'),
});

export default connect(mapStateToProps)(ConfigureProjectsFooter);
