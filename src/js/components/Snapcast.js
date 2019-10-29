
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import VolumeControl from './Fields/VolumeControl';
import MuteControl from './Fields/MuteControl';
import LatencyControl from './Fields/LatencyControl';
import TextField from './Fields/TextField';
import Icon from './Icon';

import * as helpers from '../helpers';
import * as coreActions from '../services/core/actions';
import * as uiActions from '../services/ui/actions';
import * as snapcastActions from '../services/snapcast/actions';

class Snapcast extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clients_expanded: [],
    };
  }

  componentDidMount() {
    const { connected, actions: snapcastActions } = this.props;
    if (this.props.connected) {
      actions.getServer();
    }
  }

  componentWillReceiveProps(newProps) {
    const { connected, actions: snapcastActions } = this.props;
    if (newProps.connected && !connected) {
      actions.getServer();
    }
  }

  toggleClientExpanded(client_id) {
    const { clients_expanded } = this.state;
    const index = clients_expanded.indexOf(client_id);

    if (index >= 0) {
      clients_expanded.splice(index, 1);
    } else {
      clients_expanded.push(client_id);
    }

    this.setState({ clients_expanded });
  }

  renderClientsList(group, groups) {
    const {
      snapcastActions: actions,
    } = this.props;

    if (!this.props.show_disconnected_clients && group.clients) {
      var clients = helpers.applyFilter('connected', true, group.clients);
    } else {
      var { clients } = group;
    }

    if (!clients || clients.length <= 0) {
      return (
        <div className="text mid_grey-text">
          No clients
        </div>
      );
    }

    return (
      <div className="list snapcast__clients">
        {
          clients.map((client) => {
            let class_name = 'list__item list__item--no-interaction snapcast__client';
            if (client.connected) {
              class_name += ' snapcast__client--connected';
            } else {
              class_name += ' snapcast__client--disconnected';
            }

            if (this.state.clients_expanded.includes(client.id)) {
              return (
                <div className={`${class_name} snapcast__client--expanded`} key={client.id}>
                  <div className="snapcast__client__header" onClick={(e) => this.toggleClientExpanded(client.id)}>
                    {client.name}
                    <div className="snapcast__client__header__icons">
                      {!client.connected ? <Icon name="power_off" className="disconnected" /> : null}
                      <Icon name="expand_less" />
                    </div>
                  </div>
                  <div className="snapcast__client__details">
                    <label className="field">
                      <div className="name">
                        Name
                      </div>
                      <div className="input">
                        <TextField
                          onChange={(value) => actions.setClientName(client.id, value)}
                          value={client.name}
                        />
                      </div>
                    </label>
                    <label className="field dropdown">
                      <div className="name">
                        Group
                      </div>
                      <div className="input">
                        <select onChange={(e) => actions.setClientGroup(client.id, e.target.value)} value={group.id}>
                          {
                            groups.map((group) => (
                              <option value={group.id} key={group.id}>
                                {group.name ? group.name : `Group ${group.id.substring(0, 3)}`}
                              </option>
                            ))
                          }
                          <option value={group.id}>
                            New group
                          </option>
                        </select>
                      </div>
                    </label>
                    <div className="snapcast__client__volume field">
                      <div className="name">
                        Volume
                      </div>
                      <div className="input">
                        <MuteControl
                          className="snapcast__client__mute-control"
                          mute={client.mute}
                          onMuteChange={(mute) => actions.setClientMute(client.id, mute)}
                        />
                        <VolumeControl
                          className="snapcast__client__volume-control"
                          volume={client.volume}
                          onVolumeChange={(percent) => actions.setClientVolume(client.id, percent)}
                        />
                      </div>
                    </div>
                    <div className="snapcast__client__latency field">
                      <div className="name">
                        Latency
                      </div>
                      <div className="input">
                        <LatencyControl
                          max="150"
                          value={client.latency}
                          onChange={(value) => actions.setClientLatency(client.id, parseInt(value))}
                        />
                        <TextField
                          className="tiny"
                          type="number"
                          onChange={(value) => actions.setClientLatency(client.id, parseInt(value))}
                          value={String(client.latency)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div className={`${class_name} snapcast__client--collapsed`} key={client.id}>
                <div className="snapcast__client__header" onClick={(e) => this.toggleClientExpanded(client.id)}>
                  {client.name}
                  <div className="snapcast__client__header__icons">
                    {!client.connected ? <Icon name="power_off" className="disconnected" /> : null}
                    <Icon name="expand_more" />
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }

  render() {
    const {
      snapcastActions: actions,
      uiActions,
      snapcast: {
        host,
        port,
        enabled,
        connected,
      },
    } = this.props;

    const streams = [];
    for (var id in this.props.streams) {
      if (this.props.streams.hasOwnProperty(id)) {
        streams.push(this.props.streams[id]);
      }
    }

    const groups = [];
    for (var id in this.props.groups) {
      if (this.props.groups.hasOwnProperty(id)) {
        groups.push(this.props.groups[id]);
      }
    }

    return (
      <div className="snapcast">

        <div className="field checkbox">
          <div className="name">Enabled</div>
          <div className="input">
            <label>
              <input
                type="checkbox"
                name="enabled"
                checked={enabled}
                onChange={() => actions.set({ enabled: !enabled })}
              />
              <span className="label">
                Enabled
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                name="show_disconnected_clients"
                checked={this.props.show_disconnected_clients}
                onChange={() => uiActions.set({ snapcast_show_disconnected_clients: !this.props.show_disconnected_clients })}
              />
              <span className="label">
                Show disconnected clients
              </span>
            </label>
          </div>
        </div>

        <div className="field">
          <div className="name">Host</div>
          <div className="input">
            <TextField
              value={host}
              onChange={value => actions.set({ host: value })}
            />
          </div>
        </div>

        <div className="field">
          <div className="name">Port</div>
          <div className="input">
            <TextField
              value={port}
              onChange={value => actions.set({ port: value })}
            />
          </div>
        </div>

        <div className="snapcast__groups">
          {
            groups.map((group) => {
              group = helpers.collate(group, { clients: this.props.clients });

              // Average our clients' volume for an overall group volume
              let group_volume = 0;
              for (let i = 0; i < group.clients.length; i++) {
                const client = group.clients[i];
                group_volume += client.volume;
              }
              group_volume /= group.clients.length;

              return (
                <div className="snapcast__group" key={group.id}>
                  <div className="field text">
                    <div className="name">
                      Name
                    </div>
                    <div className="input">
                      <TextField
                        value={group.name}
                        onChange={value => actions.setGroupName(group.id, value)}
                      />
                    </div>
                  </div>
                  <div className="field dropdown">
                    <div className="name">
                      Stream
                    </div>
                    <div className="input">
                      <select onChange={(e) => actions.setGroupStream(group.id, e.target.value)} value={group.stream_id}>
                        {
                          streams.map((stream) => (
                            <option value={stream.id} key={stream.id}>
                              {stream.id}
                              {' '}
                              (
                                {stream.status}
                              )
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <div className="name">
                      Volume
                    </div>
                    <div className="input">
                      <MuteControl
                        className="snapcast__group__mute-control"
                        mute={group.muted}
                        onMuteChange={(mute) => actions.setGroupMute(group.id, mute)}
                      />
                      <VolumeControl
                        className="snapcast__group__volume-control"
                        volume={group_volume}
                        onVolumeChange={(percent, old_percent) => actions.setGroupVolume(group.id, percent, old_percent)}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <div className="name">
                      Clients
                    </div>
                    <div className="input">
                      {this.renderClientsList(group, groups)}
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  snapcast: state.snapcast,
  show_disconnected_clients: (
    state.ui.snapcast_show_disconnected_clients !== undefined
      ? state.ui.snapcast_show_disconnected_clients
      : false
  ),
  streams: (state.snapcast.streams ? state.snapcast.streams : null),
  groups: (state.snapcast.groups ? state.snapcast.groups : null),
  clients: (state.snapcast.clients ? state.snapcast.clients : null),
});

const mapDispatchToProps = (dispatch) => ({
  coreActions: bindActionCreators(coreActions, dispatch),
  uiActions: bindActionCreators(uiActions, dispatch),
  snapcastActions: bindActionCreators(snapcastActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Snapcast);
