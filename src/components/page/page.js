import React from 'react';

export default class Page extends React.Component {

  static propTypes = {
    children: React.PropTypes.node.isRequired
  }

  static contextTypes = {
    location: React.PropTypes.object.isRequired
  };

  displayName = 'Page'

  /**
  * render
  * @return {ReactElement} markup
  */
  render() {
    return (
      <div className="page top-level">
        <div className="container main">
          {this.props.children}
        </div>
      </div>
    );
  }
}
