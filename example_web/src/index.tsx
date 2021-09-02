import { render } from 'react-dom';
import * as React from 'react';
import 'regenerator-runtime/runtime';

interface Props {
}

interface State {
    date: number;
}

class Clock extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            date: 0
        }
    }
    
    timerID: any;

    test() {
        for(let i=0; i<10000; i++){
            Date.now() + 222;
        }
    }

    async testAsync() {
        await new Promise<void>((resolve, reject) => {
            setTimeout(() => {resolve()}, 2000);
        });
        return 0;
    }

    componentDidMount() {
        this.test();
        this.testAsync();
        this.timerID = setInterval(
            () => {
                setTimeout(() => {
                    this.setState({
                        date: this.state.date + 1
                    });
                })
                
                setTimeout(() => {
                    this.setState({
                        date: this.state.date + 1
                    });
                })
            },
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    render() {
        return (
            <div>
                <h1>Hello, world!</h1>
                <h2>It is {this.state.date}.</h2>
            </div>
        );
    }
}

render(<Clock />, document.getElementById("root"))