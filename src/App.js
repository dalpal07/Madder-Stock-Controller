import {Box, styled} from "@mui/material";
import React, {useEffect, useMemo, useRef, useState} from "react";

const FULL_JOYSTICK_RADIUS = 86;
const JOYSTICK_KNOB_RADIUS = 50;
const MAX_JOYSTICK_DISTANCE = 35;
const MAX_JOYSTICK_DISPLAY_AREA_LENGTH = 350;
const MIN_JOYSTICK_DISPLAY_AREA_LENGTH = 275;
const MAX_JOYSTICK_TOUCH_AREA_LENGTH = MAX_JOYSTICK_DISPLAY_AREA_LENGTH - (FULL_JOYSTICK_RADIUS * 2);
const MIN_JOYSTICK_TOUCH_AREA_LENGTH = MIN_JOYSTICK_DISPLAY_AREA_LENGTH - (FULL_JOYSTICK_RADIUS * 2);

const SMALL_BUTTON_RADIUS = 25.5;
const SMALL_BUTTON_GAP = 20;
const LARGE_BUTTON_RADIUS = 62.5;
const LARGE_BUTTON_GAP = -15;

const COMPONENT_GAP = 0;
const PADDING_Y = 25;
const PADDING_X = 35;
const HOME_PLUS_BOTTOM_MARGIN = 89;
const LOGO_WIDTH = 63;
const LOGO_HEIGHT = 32;

const ControllerPageBox = styled(Box)({
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#ECECEC',
    touchAction: 'none',
    padding: `${PADDING_Y}px ${PADDING_X}px`,
    gap: COMPONENT_GAP,
});

const SideContainer = styled(Box)(({align = 'center', justify = 'center'}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: align,
    justifyContent: justify,
    flex: 1,
    height: '100%',
    minWidth: MIN_JOYSTICK_DISPLAY_AREA_LENGTH,
}));

const MiddleContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
});

const HomePlusContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SMALL_BUTTON_GAP,
    marginBottom: HOME_PLUS_BOTTOM_MARGIN,
    flexShrink: 0,
});

const JoystickDisplayContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    maxWidth: MAX_JOYSTICK_DISPLAY_AREA_LENGTH,
    maxHeight: MAX_JOYSTICK_DISPLAY_AREA_LENGTH,
});

const JoystickTouchContainer = styled(Box)({
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    height: `calc(100% - ${FULL_JOYSTICK_RADIUS * 2}px)`,
    width: `calc(100% - ${FULL_JOYSTICK_RADIUS * 2}px)`,
});

const JoystickPlaceholder = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="153" height="153" viewBox="0 0 153 153" fill="none">
        <circle cx="76.4995" cy="76.4999" r="49.4999" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M60.2759 132.721L76.4986 153L92.7211 132.721C87.5701 134.205 82.1273 135 76.4989 135C70.8702 135 65.4271 134.205 60.2759 132.721Z"
              fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M132.72 92.7216C134.204 87.5705 134.999 82.1277 134.999 76.4993C134.999 70.8706 134.204 65.4276 132.72 60.2764L152.999 76.499L132.72 92.7216Z"
              fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M60.2759 20.2787L76.4988 0L92.7213 20.2781C87.5705 18.7946 82.1279 17.9998 76.4996 17.9998C70.8706 17.9998 65.4273 18.7948 60.2759 20.2787Z"
              fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M20.2778 60.2773L-0.000488281 76.5L20.278 92.7228C18.7942 87.5715 17.9993 82.1285 17.9993 76.4998C17.9993 70.8713 18.7942 65.4284 20.2778 60.2773Z"
              fill="#D9D9D9"/>
    </svg>
);

const Logo = () => (
    <svg width={LOGO_WIDTH} height={LOGO_HEIGHT} viewBox="0 0 63 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd"
              d="M5.51724 0C2.47015 0 0 2.47015 0 5.51724V26.4828C0 29.5298 2.47015 32 5.51724 32H56.6437C59.6908 32 62.1609 29.5298 62.1609 26.4828V5.51724C62.1609 2.47015 59.6908 0 56.6437 0H5.51724ZM38.8242 15.1644C38.9097 14.524 39.4889 13.7435 40.1208 13.8302V13.8335C43.9844 14.3639 52.9655 16.0684 52.9655 20.4147C52.9655 25.1212 41.9572 27.5862 31.0805 27.5862C20.2038 27.5862 9.1954 25.1212 9.1954 20.4147C9.1954 16.2151 17.9396 13.8836 26.9601 13.3632C26.9667 13.3632 26.97 13.3532 26.97 13.3532V12.4392C26.97 12.4359 26.9667 12.4292 26.9601 12.4292C21.6452 11.5653 21.0462 9.48057 21.0462 8.58329C21.0462 5.71801 26.2493 4.41379 31.0838 4.41379C35.9182 4.41379 41.1213 5.71801 41.1213 8.58329C41.1213 9.47723 40.5223 11.5653 35.2074 12.4292C35.2008 12.4292 35.1975 12.4392 35.1975 12.4392V16.2051C35.1975 16.3719 35.2139 16.542 35.2436 16.7088L35.3653 17.3893C35.3653 18.0497 34.6545 18.2799 33.993 18.2499C33.4302 18.2232 32.6305 18.0197 32.7292 17.3092C32.9102 16.0017 32.9761 12.7228 32.8938 11.9256C32.8938 11.3318 33.3282 10.6547 33.9107 10.5847C36.6455 10.2578 38.3108 9.56062 38.8933 9.04027C39.173 8.7901 39.1598 8.36648 38.8768 8.17301C38.0442 7.60596 35.5957 6.41182 31.4096 6.41182C27.6644 6.41182 25.3476 7.49922 24.3175 8.09963C23.9094 8.33646 23.8995 8.94354 24.3109 9.17703C25.1962 9.68404 26.5159 10.0009 27.5032 10.1477C28.1943 10.2511 28.7603 10.7548 28.9545 11.4352C29.4013 13.0056 29.3176 15.6632 29.2527 17.7265C29.2143 18.9458 29.1824 19.9575 29.2704 20.4147C29.3922 21.0484 28.7537 21.2486 28.1186 21.2486C27.8026 21.2486 27.3847 21.2185 27.049 21.1051C26.6771 20.9817 26.4171 20.6382 26.4566 20.478C26.9869 18.3984 26.9692 16.0456 26.9669 15.7363C26.9668 15.7232 26.9667 15.7137 26.9667 15.7081C26.9667 15.7015 26.9601 15.7015 26.9569 15.7015C16.9917 16.2852 12.8155 18.3933 12.8155 20.0811C12.8155 21.7689 17.5677 25.1846 30.4223 25.1846C43.2769 25.1846 51.0666 22.6428 50.9909 20.0811C50.935 18.2098 42.8523 15.995 39.2191 16.6121C38.6147 16.7147 38.7283 15.8737 38.814 15.2395C38.8175 15.2141 38.8209 15.1891 38.8242 15.1644Z"
              fill="#C1C1C1"/>
    </svg>
);

function App() {
    const [joystickCenter, setJoystickCenter] = useState({x: 0, y: 0, id: null});
    const joystickCenterRef = useRef(joystickCenter);
    const [joystickOffset, setJoystickOffset] = useState({x: 0, y: 0});
    const joystickOffsetRef = useRef(joystickOffset);

    const joystickTouchContainerRef = useRef(null);
    const joystickTouchContainerDimensionsRef = useRef({x: 0, y: 0, width: 0, height: 0});

    const [joystickState, setJoystickState] = useState({x: 0, y: 0, id: null});
    const joystickStateRef = useRef(joystickState);
    const [circleState, setCircleState] = useState(null);
    const circleStateRef = useRef(circleState);
    const [triangleState, setTriangleState] = useState(null);
    const triangleStateRef = useRef(triangleState);
    const [homeState, setHomeState] = useState(null);
    const homeStateRef = useRef(homeState);
    const [plusState, setPlusState] = useState(null);
    const plusStateRef = useRef(plusState);

    const [playerName, setPlayerName] = useState('');

    function sendMessageToParent(message) {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(message);
        }

        if (window.parent) {
            window.parent.postMessage(message, "*");
        }
    }

    function handleMessageFromParent(event) {
        const msg = event.data;
        if (msg.name === 'vibrate') {
            sendMessageToParent(JSON.stringify({name: 'vibrate'}))
        } else if (msg.name === 'exit') {
            sendMessageToParent(JSON.stringify({name: 'exit'}));
        } else if (msg.name === 'name') {
            setPlayerName(msg.player);
        }
    }

    function setJoystickTouchArea() {
        if (joystickTouchContainerRef.current) {
            const {x, y, width, height} = joystickTouchContainerRef.current.getBoundingClientRect();
            console.log({x, y, width, height});
        }
    }

    useEffect(() => {
        window.addEventListener('message', handleMessageFromParent);
        window.addEventListener('resize', setJoystickTouchArea);
        window.addEventListener('orientationchange', setJoystickTouchArea);
        window.addEventListener('load', setJoystickTouchArea);

        sendMessageToParent(JSON.stringify({name: 'ready'}));

        return () => {
            window.removeEventListener('message', handleMessageFromParent);
            window.removeEventListener('resize', setJoystickTouchArea);
            window.removeEventListener('orientationchange', setJoystickTouchArea);
            window.removeEventListener('load', setJoystickTouchArea);
        }
    }, []);

    useEffect(() => {
        const controllerState = {
            name: playerName,
            joystick: {
                x: joystickState.x,
                y: joystickState.y,
            },
            circle: circleState !== null,
            triangle: triangleState !== null,
            plus: plusState !== null,
        }
        sendMessageToParent(JSON.stringify({name: 'controller-state', state: JSON.stringify(controllerState)}));
    }, [joystickState, circleState, triangleState, plusState]);


    return (
        <ControllerPageBox>
            <SideContainer align={'flex-start'} justify={'flex-end'}>
                <JoystickDisplayContainer>
                    <JoystickTouchContainer
                        ref={joystickTouchContainerRef}
                    >
                        {
                            joystickCenter.id === null ?
                                <JoystickPlaceholder/>
                                :
                                <Box style={{
                                    position: 'absolute',
                                    top: joystickCenter.y - FULL_JOYSTICK_RADIUS,
                                    left: joystickCenter.x - FULL_JOYSTICK_RADIUS,
                                    width: FULL_JOYSTICK_RADIUS * 2,
                                    height: FULL_JOYSTICK_RADIUS * 2,
                                    borderRadius: '50%',
                                    backgroundColor: '#DFDFDF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Box style={{
                                        width: JOYSTICK_KNOB_RADIUS * 2,
                                        height: JOYSTICK_KNOB_RADIUS * 2,
                                        borderRadius: '50%',
                                        backgroundColor: '#F1F1F1',
                                        border: '5px solid #BB3D3D',
                                        filter: 'drop-shadow(0px 0px 20px rgba(0, 0, 0, 0.15)) drop-shadow(0px 0px 7px rgba(0, 0, 0, 0.20))',
                                    }}/>
                                </Box>
                        }
                    </JoystickTouchContainer>
                </JoystickDisplayContainer>
            </SideContainer>
            <MiddleContainer>
                <Logo/>
                <HomePlusContainer>
                    {
                        homeState === null ?
                            <img src={'./assets/home.png'} alt={'home'} style={{width: SMALL_BUTTON_RADIUS * 2, height: SMALL_BUTTON_RADIUS * 2}}/>
                            :
                            <img src={'./assets/home-pressed.png'} alt={'home pressed'} style={{width: SMALL_BUTTON_RADIUS * 2, height: SMALL_BUTTON_RADIUS * 2}}/>
                    }
                    {
                        plusState === null ?
                            <img src={'./assets/plus.png'} alt={'plus'} style={{width: SMALL_BUTTON_RADIUS * 2, height: SMALL_BUTTON_RADIUS * 2}}/>
                            :
                            <img src={'./assets/plus-pressed.png'} alt={'plus pressed'} style={{width: SMALL_BUTTON_RADIUS * 2, height: SMALL_BUTTON_RADIUS * 2}}/>
                    }
                </HomePlusContainer>
            </MiddleContainer>
            <SideContainer align={'flex-end'} justify={'flex-end'}>
                <SideContainer align={'flex-end'} justify={'flex-end'} style={{minWidth: MIN_JOYSTICK_DISPLAY_AREA_LENGTH, maxWidth: MAX_JOYSTICK_DISPLAY_AREA_LENGTH}}>
                    {
                        circleState === null ?
                            <img src={'./assets/circle.png'} alt={'circle'} style={{width: LARGE_BUTTON_RADIUS * 2, height: LARGE_BUTTON_RADIUS * 2, marginBottom: LARGE_BUTTON_GAP}}/>
                            :
                            <img src={'./assets/circle-pressed.png'} alt={'circle pressed'} style={{width: LARGE_BUTTON_RADIUS * 2, height: LARGE_BUTTON_RADIUS * 2, marginBottom: LARGE_BUTTON_GAP}}/>
                    }
                    {
                        triangleState === null ?
                            <img src={'./assets/triangle.png'} alt={'triangle'} style={{width: LARGE_BUTTON_RADIUS * 2, height: LARGE_BUTTON_RADIUS * 2, marginRight: (LARGE_BUTTON_RADIUS * 2) + LARGE_BUTTON_GAP}}/>
                            :
                            <img src={'./assets/triangle-pressed.png'} alt={'triangle pressed'} style={{width: LARGE_BUTTON_RADIUS * 2, height: LARGE_BUTTON_RADIUS * 2, marginRight: (LARGE_BUTTON_RADIUS * 2) + LARGE_BUTTON_GAP}}/>
                    }
                </SideContainer>
            </SideContainer>
        </ControllerPageBox>
    );
}

export default App;