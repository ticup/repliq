///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../shared/Schema.ts" />
///<reference path="../../../src/client/references.d.ts" />

import * as React     from 'react';
import * as ReactDOM  from 'react-dom';
import {Status} from '../shared/Schema';
import {Time} from '../../../src/shared/protocols/Time';

import {RepliqClient, Repliq} from "../../../src/client/index";

let client = new RepliqClient({Status, Time}, 1000);

class MainComponent extends React.Component<{}, {}> {
    render() {
        return (
            <div className="ui one column stackable grid">
                <TimeComponent getTime={() => client.send("startTime")} title="Start Time"/>
                <TimeComponent getTime={() => client.send("endTime")} title="End Time"/>
                <LightComponent />
            </div>

        );
    }
}

interface TimeState {
    time: Time;
}

class TimeComponent extends React.Component<{getTime():Promise<Time>, title: String}, TimeState>{

    state : TimeState = {time: Time.stub()};

    componentDidMount() {
        this.props.getTime().then((time: Time) => {
            this.setState({time});
            time.on("change", () => {
                this.setState({time});
            });
        });
    }

    submit() {
        let hour = ReactDOM.findDOMNode<HTMLInputElement>(this.refs["hour"]).valueAsNumber;
        let minutes = ReactDOM.findDOMNode<HTMLInputElement>(this.refs["minutes"]).valueAsNumber;
        this.state.time.setHour(hour);
        this.state.time.setMinutes(minutes);
        client.yield();
    }

    render() {
        return (
            <div className="row">
                <div className="column">
                    <h4> {this.props.title} -- {this.state.time.getHour()}:{this.state.time.getMinutes()}h</h4>
                    <div className="ui action left icon labeled input">
                        <i className="time icon"></i>
                        <input ref="hour" type="text" name="Start Hour" placeholder="hour"></input>
                        <input ref="minutes" type="text" name="Start Minute" placeholder="minutes"></input>
                        <div className="ui teal button" onClick={(e)=>this.submit()}>Set!</div>
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
        client.send("status").then((status: Status) => {
            window["STATUS"] = status;
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
                    <div onClick={(e) => this.switchLight()} className={"ui " + (this.state.status.confirmed() ? "teal" : "red") + " button"}>{this.state.status.getVal()}</div>
                </div>
            </div>
        );
    }
}




ReactDOM.render(
    <MainComponent />,
    document.getElementById('main')
);
