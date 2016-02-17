///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../schema.ts" />
///<reference path="../../../src/client/references.d.ts" />

import * as React     from 'react';
import * as ReactDOM  from 'react-dom';
import {Message, MessageList} from '../schema';

import {RepliqClient, Repliq} from "../../../src/client/index";

let client = new RepliqClient(null, {Message, MessageList}, 1000);

class MainComponent extends React.Component<{}, {}> {
    render() {
        return (
            <div className="ui three column centered stackable grid">
                <div className="ui column">
                    <div className="ui stackable vertically divided grid">
                        <MessageListComponent getMessages={()=> client.send("lobby")} title="Lobby" />
                    </div>
                </div>
            </div>

        );
    }
}

interface MessageListState {
    messages: MessageList;
}

class MessageListComponent extends React.Component<{getMessages():Promise<MessageList>, title: String}, MessageListState>{

    state : MessageListState = {messages: MessageList.stub()};

    componentDidMount() {
        this.props.getMessages().then((messages: MessageList) => {
            this.setState({messages});
            client.on("yield", () =>
                this.setState({messages})
            );
        });
    }

    render() {
        let items = this.state.messages.get("items").map((message: Message) => <MessageComponent message={message}/>);

        return (
            <div>
                <div className="row">
                    <div className="ui list">
                        {items}
                    </div>
                </div>
                <NewMessageComponent sendMessage={(text: string) => this.state.messages.add(Message.create({text}))}/>
            </div>
        );
    }
}


class MessageComponent extends React.Component<{message: Message}, {}>{


    render() {
        return (
            <div className="item">
                <div>
                    {this.props.message.get("text")}
                </div>
            </div>
        );
    }
}



class NewMessageComponent extends React.Component<{sendMessage(text: string):void }, {}>{

    submit() {
        let text = ReactDOM.findDOMNode<HTMLInputElement>(this.refs["text"]).value;
        this.props.sendMessage(text);
    }

    render() {
        return (
            <div className="row">
                <div className="column">
                    <div className="segment">
                        <div className="ui action left icon labeled input">
                            <i className="comment icon"></i>
                            <input ref="text" type="text" name="Message" placeholder="say something..."></input>
                            <div className="ui teal button" onClick={(e)=>this.submit()}>Set!</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <MainComponent />,
    document.getElementById('main')
);
