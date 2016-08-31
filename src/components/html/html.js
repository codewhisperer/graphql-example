/* eslint max-len: 0 */
import React from 'react';

export default class Html extends React.Component {

  static propTypes = {
    title: React.PropTypes.string,
    description: React.PropTypes.string,
    css: React.PropTypes.string,
    body: React.PropTypes.string.isRequired,
    entry: React.PropTypes.string.isRequired,
    production: React.PropTypes.bool.isRequired
  };

  static defaultProps = {
    title: '',
    description: ''
  };

  /**
  * render
  * @return {ReactElement} markup
  */
  render() {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <title>{this.props.title}</title>
          <meta name="description" content={this.props.description} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta httpEquiv="content-type" content="text/html;charset=utf-8" />
          <meta httpEquiv="content-language" content="en-gb" />
          <link rel="shortcut icon" href="//img01.bt.co.uk/s/assets/020714/images/favicon.ico" />
          <link rel="apple-touch-icon" href="/mobile/images/apple-touch-icon.png" />
          <If condition={this.props.production}>
            <link type="text/css" rel="stylesheet" href={this.props.css} />
          <Else />
            <style
              id="css"
              dangerouslySetInnerHTML={{
                __html: this.props.css
              }}
            />
          </If>
        </head>
        <body>
          {/* Placeholder for dante header */}
          <div
            id="app"
            dangerouslySetInnerHTML={{
              __html: this.props.body
            }}
          />
          <script src={this.props.entry}></script>
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: 'if (typeof window._satellite !== "undefined") { window._satellite.pageBottom(); }'
            }}
          />
        </body>
      </html>
    );
  }

}
