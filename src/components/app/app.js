import React from 'react';

export default class App extends React.Component {

  static propTypes = {
    children: React.PropTypes.element,
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object,
    error: React.PropTypes.object,
    dispatch: React.PropTypes.func
  };

  static childContextTypes = {
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object
  };

  getChildContext() {
    // const context = this.props.context; @mike is this needed
    return {
      location: this.props.location,
      params: this.props.params || {}
    };
  }

  /**
  * render
  * @return {ReactElement} markup
  */
  render() {
    return this ? (
      <div>
        {React.cloneElement(this.props.children, {
          key: this.props.location.pathname
        })}
      </div>
    ) : this.props.children;
  }

}
