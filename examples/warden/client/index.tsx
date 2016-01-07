///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../shared/Schema.ts" />
///<reference path="../../../src/client/references.d.ts" />

import * as React     from 'react';
import * as ReactDOM  from 'react-dom';
import {Status} from '../shared/Schema';

import {RepliqClient, Repliq} from "../../../src/client/index";

let client = new RepliqClient(null, {Status: Status});
setInterval(() => client.yield(), 1000);

class MainComponent extends React.Component<{}, {}> {
    render() {
        return (
            <div className="ui one column stackable grid">
                <StartTimeComponent />
                <StopTimeComponent />
                <LightComponent />
            </div>

        );
    }
}

class StartTimeComponent extends React.Component<{}, {}>{
    render() {
        return (
                <div className="row">
                    <div className="column">
                        <h4>Start Time</h4>
                        <div className="ui action left icon labeled input">
                            <i className="time icon"></i>
                            <input ref="startHour" type="text" name="Start Hour" placeholder="hour..."></input>
                            <input ref="startMinute" type="text" name="Start Minute" placeholder="minutes..."></input>
                            <div className="ui teal button">Set!</div>
                        </div>
                    </div>
                </div>

        );
    }
}


class StopTimeComponent extends React.Component<{}, {}>{
    render() {
        return (
            <div className="row">
                <div className="column">
                    <h4>End Time</h4>
                    <div className="ui action left icon input">
                        <i className="time icon"></i>
                        <input ref="stopHour" type="text" name="Stop Hour" placeholder="hour..."></input>
                        <input ref="stopMinute" type="text" name="Stop Minute" placeholder="minutes..."></input>
                        <div className="ui teal button">Set!</div>
                    </div>
                </div>
            </div>

        );
    }
}

interface LightComponentState {
    status: Status
}

class LightComponent extends React.Component<{}, LightComponentState>{

    state : LightComponentState = {status: Status.stub()};

    componentDidMount() {
        console.log("sending to client");
        client.send("status").then((status: Status) => {
            console.log(status);
            global.status = status;
            this.setState({status});
            status.on("change", () => {
                this.setState({status});
            });
        });
    }

    switchLight() {
        let status = this.state.status;
        if (status.isOff()) {
            status.turnOn();
        } else if (status.isOn()) {
            status.turnOff();
        }
    }

    render() {
        return (
            <div className="row">
                <div className="column">
                    <h4>Status</h4>
                    <div onClick={(e) => this.switchLight()} className="ui teal button">{this.state.status.getVal()}</div>
                </div>
            </div>
        );
    }
}




ReactDOM.render(
    <MainComponent />,
    document.getElementById('main')
);
