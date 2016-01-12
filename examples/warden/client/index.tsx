///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../shared/Schema.ts" />
///<reference path="../../../src/client/references.d.ts" />

import * as React     from 'react';
import * as ReactDOM  from 'react-dom';
import {Status} from '../shared/Schema';
import {Time} from '../../../src/shared/protocols/Time';

import {RepliqClient, Repliq} from "../../../src/client/index";

let client = new RepliqClient(null, {Status, Time}, 1000);

class MainComponent extends React.Component<{}, {}> {
    render() {
        return (
            <div className="ui three column centered stackable grid">
                <div className="ui column">
                    <div className="ui stackable vertically divided grid">
                        <LightComponent />
                        <TimeComponent getTime={() => client.send("startTime")} title="Start Time"/>
                        <TimeComponent getTime={() => client.send("endTime")}   title="End Time"/>
                    </div>
                </div>
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
        let hour = parseInt(ReactDOM.findDOMNode<HTMLInputElement>(this.refs["hour"]).value, 10);
        let minutes = parseInt(ReactDOM.findDOMNode<HTMLInputElement>(this.refs["minutes"]).value, 10);
        this.state.time.setHour(hour);
        this.state.time.setMinutes(minutes);
        client.yield();
    }

    render() {
        return (
            <div className="row">
                <div className="column">
                    <div className="segment">
                        <div className="ui big label"> {this.props.title} </div>
                        <div className={"ui " + (this.state.time.confirmed() ? "" : "orange") + " big label"}> {this.state.time.getHourPretty()}:{this.state.time.getMinutesPretty()} </div>
                        <div className="ui action left icon labeled input">
                            <i className="time icon"></i>
                            <input ref="hour" type="text" name="Start Hour" placeholder="hour"></input>
                            <input ref="minutes" type="text" name="Start Minute" placeholder="minutes"></input>
                            <div className="ui teal button" onClick={(e)=>this.submit()}>Set!</div>
                        </div>
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
                    <div onClick={(e) => this.switchLight()}
                         className={"ui " + (this.state.status.confirmed() ?
                                                (this.state.status.isOn() ?
                                                    "green" :
                                                    "red") :
                                                "orange") + " big button"}>
                        Status: {this.state.status.getVal()}
                    </div>
                </div>
            </div>
        );
    }
}


global["Time"]   = Time;
global["Status"] = Status;

ReactDOM.render(
    <MainComponent />,
    document.getElementById('main')
);
