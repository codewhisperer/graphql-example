import React, { PropTypes } from 'react';
import emptyFunction from 'fbjs/lib/emptyFunction';

class ContextHolder extends React.Component {

  static propTypes = {
    context: PropTypes.shape({
      constants: PropTypes.object.required,
      onSetTitle: PropTypes.func.required,
      insertCss: PropTypes.func,
      onSetMeta: PropTypes.func.required,
      onPageNotFound: PropTypes.func.required
    }),
    children: PropTypes.element.isRequired
  };

  static childContextTypes = {
    constants: PropTypes.object,
    insertCss: PropTypes.func,
    onSetTitle: PropTypes.func,
    onSetMeta: PropTypes.func,
    onPageNotFound: PropTypes.func
  };

  getChildContext() {
    const context = this.props.context;
    return {
      constants: context.constants,
      insertCss: context.insertCss || emptyFunction,
      onSetTitle: context.onSetTitle || emptyFunction,
      onSetMeta: context.onSetMeta || emptyFunction,
      onPageNotFound: context.onPageNotFound || emptyFunction
    };
  }

  render() {
    const { children } = this.props;
    return React.Children.only(children);
  }
}

export default ContextHolder;
