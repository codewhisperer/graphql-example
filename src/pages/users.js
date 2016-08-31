import React from 'react';
import Page from '../components/page';
import { connect } from 'react-redux';
import { getGraph } from '../actions/dataRequest.action';

@connect(state => ({ query: state.query }))
export default class Users extends React.Component {
  static propTypes = {
    query: React.PropTypes.object,
    dispatch: React.PropTypes.func
  }

  displayName = 'Users'

  componentDidMount() {
    this.props.dispatch(getGraph(`
      {
        user(id:"1") {
          name
        }
      }
    `));
  }

  render() {
    return (
      <Page>
        <If condition={this.props.query.data}>
          User name: {this.props.query.data.name}
        </If>
      </Page>
    );
  }
}
