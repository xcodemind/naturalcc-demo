import React from 'react';
import styled from 'styled-components';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import {ThemeProvider, Footer, Header, Layout} from '@allenai/varnish';
// import {ThemeProvider, Header, Layout} from 'antd';
// import {Layout as AntLayout} from 'antd';
import Menu from './components/Menu';
import ModelIntro from './components/ModelIntro';
import {ScrollToTopOnPageChange} from './components/ScrollToTopOnPageChange';
import {modelComponents, modelRedirects} from './models'
import {PaneTop} from './components/Pane';

import WaitingForPermalink from './components/WaitingForPermalink';
// import Info from './components/Info';

import './css/App.css';
import '@allenai/varnish/dist/varnish.css';
// import '~antd/dist/antd.css';

const {Content, DefaultAppLayoutProvider} = Layout;
const { HeaderColumns, HeaderTitle } = Header;
// const {HeaderColumns} = Header;
// const {Header} = AntLayout

const DEFAULT_PATH = "/code-summarization"

const App = () => (
    <ThemeProvider>
        <Router>
            <DefaultAppLayoutProvider layoutVariant="app">
                <ScrollToTopOnPageChange/>
                <Switch>
                    <Route exact path="/" render={() => (
                        <Redirect to={DEFAULT_PATH}/>
                    )}/>
                    <Route path="/:model/:slug?" component={Demo}/>
                </Switch>
            </DefaultAppLayoutProvider>
        </Router>
    </ThemeProvider>
)

const Demo = (props) => {
    const {model, slug} = props.match.params
    const redirectedModel = modelRedirects[model] || model
    return (
        <Layout bgcolor="white">
            <Header style={{paddingLeft:"0",paddingRight:"0"}} id="myheader">
                <HeaderColumns style={{background:"#072f67"}}>
                    <HeaderTitle style={{color:"white",paddingLeft:"2rem"}}>Natural CC</HeaderTitle>
                </HeaderColumns>
            </Header>
            <Layout>
                <Menu redirectedModel={redirectedModel}/>
                <Layout>
                    <FullSizeContent >
                        {/* <a href="https://github.com/winRh" className="github-corner" aria-label="View source on GitHub">
                            <svg style={{width:"80", height:"80", viewBox:"0 0 250 250", fill:"#151513",color:"#fff", position: "absolute", top: 0, border: 0, right:"0", ariaHidden:"true"}} >
                                <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style={{transformOrigin:"130px 106px"}} className="octo-arm">  
                                </path>
                                <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body">
                                </path>
                            </svg>
                        </a> */}
                        {/* <a href="https://github.com/violet227">
                            <img width="149" height="149" 
                                style={{position: "absolute", top: "0", right: "0", border: "0" }}
                                src="https://www.pianshen.com/images/483/b38d65207a9b9492720f7226f6a757f3.png" className="attachment-full size-full" alt="Fork me on GitHub" data-recalc-dims="1">
                            </img>
                        </a> */}
                        <div style={styles.gitForkTag}>
                            <a style={styles.gitLink} href="https://github.com/xcodemind/naturalcc-demo" target="_blank">Fork on Github</a>
                        </div>
                        <SingleTaskDemo model={redirectedModel} slug={slug}/>
                    </FullSizeContent>
                </Layout>
            </Layout>
        </Layout>
    );
}
const styles = {
    gitForkTag: {
        position: "fixed",
        top:"0",
        right: "0",
        backgroundColor: "#f9f9f9",
        borderTop: "1px solid #e8e8e8",
        borderBottom:"1px solid #e8e8e8",
        padding: "5px 0px",
        transform: "rotate(45deg) translateY(54px) translateX(54px)",
        zindex: "1"
      },
    gitLink: {
        textDecoration: "none",
        color: "black"
    }
}

const FullSizeContent = styled(Content)`
    padding: 0;
`;

// const HeaderColumnsWithSpace = styled(HeaderColumns)`
//     padding: ${({theme}) => theme.spacing.md} 0;
// `;

class SingleTaskDemo extends React.Component {
    constructor(props) {
        super(props);

        // React router supplies us with a model name and (possibly) a slug.
        const {model, slug} = props;

        this.state = {
            slug,
            selectedModel: model,
            requestData: null,
            responseData: null
        }
    }

    // We also need to update the state whenever we receive new props from React router.
    componentDidUpdate() {
        const {model, slug} = this.props;
        if (model !== this.state.selectedModel || slug !== this.state.slug) {
            const isModelChange = model !== this.state.selectedModel;
            const responseData = (
                isModelChange
                    ? null
                    : this.state.responseData
            );
            const requestData = (
                isModelChange
                    ? null
                    : this.state.requestData
            );
            this.setState({selectedModel: model, slug, responseData, requestData});
        }
    }

    // After the component mounts, we check if we need to fetch the data
    // for a permalink.
    componentDidMount() {
        const {slug, responseData} = this.state;

        // If this is a permalink and we don't yet have the data for it...
        // if (slug && !responseData) {
        //     // Make an ajax call to get the permadata,
        //     // and then use it to update the state.
        //     fetch(`/api/permalink/${slug}`)
        //         .then((response) => {
        //             return response.json();
        //         }).then((json) => {
        //         const {request_data} = json;
        //         this.setState({requestData: request_data});
        //     }).catch((error) => {
        //         // If a permalink doesn't resolve, we don't want to fail. Instead remove the slug from
        //         // the URL. This lets the user at least prepare a submission.
        //         console.error('Error loading permalink:', error);
        //         // Start over without the slug.
        //         window.location.replace(window.location.pathname.replace(`/${slug}`, ''));
        //     });
        // }
    }

    render() {
        const {slug, selectedModel, requestData, responseData} = this.state;
        console.log(slug, selectedModel, requestData, responseData);
        const updateData = (requestData, responseData) => this.setState({requestData, responseData})

        if (slug && !requestData) {
            // We're still waiting for permalink data, so just return the placeholder component.
            return (<WaitingForPermalink/>);
        } else if (modelComponents[selectedModel]) {
            // This is a model we know the component for, so render it.
            return React.createElement(modelComponents[selectedModel], {
                requestData,
                responseData,
                selectedModel,
                updateData
            })
            // return (<WaitingForPermalink/>);
        }
    }
}

export default App;
