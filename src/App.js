import {Box} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";

const FIRE_BUTTON_RADIUS = 100;
const JOYSTICK_RADIUS = 119;
const JOYSTICK_THROTTLE_RADIUS = 68.25;
const MAX_JOYSTICK_DISTANCE = 50;
const BOOST_BUTTON_RADIUS = 33.85;
const MINUS_BUTTON_RADIUS = 13;
const PLUS_BUTTON_RADIUS = 13;
const LEAVE_ICON_RADIUS = 9;

let interval;

function App() {
    const [joystickCenter, setJoystickCenter] = useState({x: 0, y: 0});
    const joystickCenterRef = useRef(joystickCenter);
    const [fireButtonCenter, setFireButtonCenter] = useState({x: 0, y: 0});
    const fireButtonCenterRef = useRef(fireButtonCenter);
    const [boostButtonCenter, setBoostButtonCenter] = useState({x: 0, y: 0});
    const boostButtonCenterRef = useRef(boostButtonCenter);
    const [minusCenter, setMinusCenter] = useState({x: 0, y: 0});
    const minusCenterRef = useRef(minusCenter);
    const [plusCenter, setPlusCenter] = useState({x: 0, y: 0});
    const plusCenterRef = useRef(plusCenter);
    const [leaveIconCenter, setLeaveIconCenter] = useState({x: 0, y: 0});
    const leaveIconCenterRef = useRef(leaveIconCenter);

    const [joystickState, setJoystickState] = useState({x: 0, y: 0, id: null});
    const joystickStateRef = useRef(joystickState);
    const [fireState, setFireState] = useState({id: null, active: false});
    const fireStateRef = useRef(fireState);
    const [boostPressed, setBoostPressed] = useState(null);
    const boostPressedRef = useRef(boostPressed);
    const [minusPressed, setMinusPressed] = useState(null);
    const minusPressedRef = useRef(minusPressed);
    const [plusPressed, setPlusPressed] = useState(null);
    const plusPressedRef = useRef(plusPressed);

    const [percentBoost, setPercentBoost] = useState(100);
    const percentBoostRef = useRef(percentBoost);

    function sendMessageToParent(message) {
        window.ReactNativeWebView.postMessage(message);
    }

    function handleMessageFromParent(event) {
        const msg = event.data;
        if (msg.name === 'vibrate') {
            sendMessageToParent(JSON.stringify({name: 'vibrate'}))
        }
        else if (msg.name === 'exit') {
            sendMessageToParent(JSON.stringify({name: 'exit'}));
        }
        else if (msg.name === 'touchDown') {
            const {touches} = msg;
            onTouchStart({changedTouches: touches});
        }
        else if (msg.name === 'touchMove') {
            const {touches} = msg;
            onTouchMove({changedTouches: touches});
        }
        else if (msg.name === 'touchUp') {
            const {touches} = msg;
            onTouchEnd({changedTouches: touches});
        }
    }
    
    useEffect(() => {
        window.addEventListener('message', handleMessageFromParent);
        window.addEventListener('resize', setCenters);

        sendMessageToParent(JSON.stringify({name: 'ready'}));

        return () => {
            window.removeEventListener('message', handleMessageFromParent);
            window.removeEventListener('resize', setCenters);
        }
    }, []);

    useEffect(() => {
        const controllerStateString = `${joystickState.x},${joystickState.y},${fireState.active ? 1 : 0},${boostPressed !== null ? 1 : 0},${percentBoost},${minusPressed !== null ? 1 : 0},${plusPressed !== null ? 1 : 0}`;
        sendMessageToParent(JSON.stringify({name: 'move', move: controllerStateString}));
    }, [joystickState, fireState, boostPressed, minusPressed, plusPressed]);

    
    useEffect(() => {
        if (boostPressed !== null) {
            clearInterval(interval);
            setPercentBoost(0);
            percentBoostRef.current = 0;
        }
        else if (percentBoost === 0) {
            const maxCount = 100;
            let count = 0;
            interval = setInterval(() => {
                count++;
                setPercentBoost(count);
                percentBoostRef.current = count;
                if (count === maxCount) {
                    clearInterval(interval);
                }
            }, 100);
        }
    }, [percentBoost, boostPressed]);

    const setCenters = () => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        setFireButtonCenter({x: screenWidth - 100 - FIRE_BUTTON_RADIUS, y: screenHeight - 110 - FIRE_BUTTON_RADIUS});
        fireButtonCenterRef.current = {x: screenWidth - 100 - FIRE_BUTTON_RADIUS, y: screenHeight - 110 - FIRE_BUTTON_RADIUS};
        setJoystickCenter({x: 100 + JOYSTICK_RADIUS, y: screenHeight - 76 - JOYSTICK_RADIUS});
        joystickCenterRef.current = {x: 100 + JOYSTICK_RADIUS, y: screenHeight - 76 - JOYSTICK_RADIUS};
        setBoostButtonCenter({x: screenWidth - 100 - (FIRE_BUTTON_RADIUS * 2) - BOOST_BUTTON_RADIUS, y: screenHeight - 91});
        boostButtonCenterRef.current = {x: screenWidth - 100 - (FIRE_BUTTON_RADIUS * 2) - BOOST_BUTTON_RADIUS, y: screenHeight - 91};
        setMinusCenter({x: 50 + MINUS_BUTTON_RADIUS, y: 30 + 4.5});
        minusCenterRef.current = {x: 50 + MINUS_BUTTON_RADIUS, y: 30 + 4.5};
        setPlusCenter({x: screenWidth - 50 - PLUS_BUTTON_RADIUS, y: 30 + PLUS_BUTTON_RADIUS})
        plusCenterRef.current = {x: screenWidth - 50 - PLUS_BUTTON_RADIUS, y: 30 + PLUS_BUTTON_RADIUS};
        setLeaveIconCenter({x: screenWidth / 2, y: 78 + LEAVE_ICON_RADIUS});
        leaveIconCenterRef.current = {x: screenWidth / 2, y: 78 + LEAVE_ICON_RADIUS};
    }

    const onTouchStart = (e) => {
        const {changedTouches} = e;
        for (let touch of changedTouches) {
            const x = touch.x;
            const y = touch.y;
            if (Math.sqrt(Math.pow(x - leaveIconCenterRef.current.x, 2) + Math.pow(y - leaveIconCenterRef.current.y, 2)) <= LEAVE_ICON_RADIUS + 5) {
                sendMessageToParent(JSON.stringify({name: 'exit-confirmation'}));
            }
            if (joystickStateRef.current.id === null) {
                if (Math.sqrt(Math.pow(x - joystickCenterRef.current.x, 2) + Math.pow(y - joystickCenterRef.current.y, 2)) <= JOYSTICK_THROTTLE_RADIUS) {
                    setJoystickState({x: Math.round((x - joystickCenterRef.current.x) / JOYSTICK_RADIUS * 100), y: Math.round((joystickCenterRef.current.y - y) / JOYSTICK_RADIUS * 100), id: touch.id});
                    joystickStateRef.current = {x: Math.round((x - joystickCenterRef.current.x) / JOYSTICK_RADIUS * 100), y: Math.round((joystickCenterRef.current.y - y) / JOYSTICK_RADIUS * 100), id: touch.id};
                    sendMessageToParent(JSON.stringify({name: 'haptic', type: 'medium'}));
                }
            }
            if (fireStateRef.current.id === null) {
                if (Math.sqrt(Math.pow(x - fireButtonCenterRef.current.x, 2) + Math.pow(y - fireButtonCenterRef.current.y, 2)) <= FIRE_BUTTON_RADIUS) {
                    setFireState({id: touch.id, active: true});
                    fireStateRef.current = {id: touch.id, active: true};
                    sendMessageToParent(JSON.stringify({name: 'haptic', type: 'medium'}))
                }
            }
            if (boostPressedRef.current === null) {
                if (Math.sqrt(Math.pow(x - boostButtonCenterRef.current.x, 2) + Math.pow(y - boostButtonCenterRef.current.y, 2)) <= BOOST_BUTTON_RADIUS + 10) {
                    setBoostPressed(touch.id);
                    boostPressedRef.current = touch.id;
                    sendMessageToParent(JSON.stringify({name: 'haptic', type: 'medium'}));
                }
            }
            if (minusPressedRef.current === null) {
                if (Math.sqrt(Math.pow(x - minusCenterRef.current.x, 2) + Math.pow(y - minusCenterRef.current.y, 2)) <= MINUS_BUTTON_RADIUS + 10) {
                    setMinusPressed(touch.id);
                    minusPressedRef.current = touch.id;
                    sendMessageToParent(JSON.stringify({name: 'haptic', type: 'light'}));
                }
            }
            if (plusPressedRef.current === null) {
                if (Math.sqrt(Math.pow(x - plusCenterRef.current.x, 2) + Math.pow(y - plusCenterRef.current.y, 2)) <= PLUS_BUTTON_RADIUS + 10) {
                    setPlusPressed(touch.id);
                    plusPressedRef.current = touch.id;
                    sendMessageToParent(JSON.stringify({name: 'haptic', type: 'light'}));
                }
            }
        }
    }

    const onTouchMove = (e) => {
        const {changedTouches} = e;
        for (let touch of changedTouches) {
            if (fireStateRef.current.id === touch.id) {
                if (!fireStateRef.current.active && Math.sqrt(Math.pow(touch.x - fireButtonCenterRef.current.x, 2) + Math.pow(touch.y - fireButtonCenterRef.current.y, 2)) <= FIRE_BUTTON_RADIUS) {
                    setFireState({id: touch.id, active: true});
                    fireStateRef.current = {id: touch.id, active: true};
                    sendMessageToParent(JSON.stringify({name: 'haptic', type: 'medium'}))
                }
                else if (fireStateRef.current.active && Math.sqrt(Math.pow(touch.x - fireButtonCenterRef.current.x, 2) + Math.pow(touch.y - fireButtonCenterRef.current.y, 2)) > FIRE_BUTTON_RADIUS) {
                    setFireState({id: touch.id, active: false});
                    fireStateRef.current = {id: touch.id, active: false};
                }
            }
            else if (joystickStateRef.current.id === touch.id) {
                const x = (touch.x - joystickCenterRef.current.x);
                const y = (joystickCenterRef.current.y - touch.y);
                const angle = Math.atan2(y, x);
                const distance = Math.min(MAX_JOYSTICK_DISTANCE, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
                const newX = Math.round(Math.cos(angle) * distance / MAX_JOYSTICK_DISTANCE * 100);
                const newY = Math.round(Math.sin(angle) * distance / MAX_JOYSTICK_DISTANCE * 100);
                setJoystickState({x: newX, y: newY, id: touch.id});
                joystickStateRef.current = {x: newX, y: newY, id: touch.id};
            }
            if (boostPressedRef.current === touch.id && Math.sqrt(Math.pow(touch.x - boostButtonCenterRef.current.x, 2) + Math.pow(touch.y - boostButtonCenterRef.current.y, 2)) > BOOST_BUTTON_RADIUS + 10) {
                setBoostPressed(null);
                boostPressedRef.current = null;
            }
            else if (boostPressedRef.current === null && Math.sqrt(Math.pow(touch.x - boostButtonCenterRef.current.x, 2) + Math.pow(touch.y - boostButtonCenterRef.current.y, 2)) <= BOOST_BUTTON_RADIUS + 10) {
                setBoostPressed(touch.id);
                boostPressedRef.current = touch.id;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'medium'}));
            }
            if (minusPressedRef.current === touch.id && Math.sqrt(Math.pow(touch.x - minusCenterRef.current.x, 2) + Math.pow(touch.y - minusCenterRef.current.y, 2)) > MINUS_BUTTON_RADIUS + 10) {
                setMinusPressed(null);
                minusPressedRef.current = null;
            }
            else if (minusPressedRef.current === null && Math.sqrt(Math.pow(touch.x - minusCenterRef.current.x, 2) + Math.pow(touch.y - minusCenterRef.current.y, 2)) <= MINUS_BUTTON_RADIUS + 10) {
                setMinusPressed(touch.id);
                minusPressedRef.current = touch.id;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'light'}))
            }
            if (plusPressedRef.current === touch.id && Math.sqrt(Math.pow(touch.x - plusCenterRef.current.x, 2) + Math.pow(touch.y - plusCenterRef.current.y, 2)) > PLUS_BUTTON_RADIUS + 10) {
                setPlusPressed(null);
                plusPressedRef.current = null;
            }
            else if (plusPressedRef.current === null && Math.sqrt(Math.pow(touch.x - plusCenterRef.current.x, 2) + Math.pow(touch.y - plusCenterRef.current.y, 2)) <= PLUS_BUTTON_RADIUS + 10) {
                setPlusPressed(touch.id);
                plusPressedRef.current = touch.id;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'light'}))
            }
        }
    }

    const onTouchEnd = (e) => {
        const {changedTouches} = e;
        for (let touch of changedTouches) {
            if (joystickStateRef.current.id === touch.id) {
                setJoystickState({x: 0, y: 0, id: null});
                joystickStateRef.current = {x: 0, y: 0, id: null};
            }
            if (fireStateRef.current.id === touch.id) {
                setFireState({id: null, active: false});
                fireStateRef.current = {id: null, active: false};
            }
            if (boostPressedRef.current === touch.id) {
                setBoostPressed(null);
                boostPressedRef.current = null;
            }
            if (minusPressedRef.current === touch.id) {
                setMinusPressed(null);
                minusPressedRef.current = null;
            }
            if (plusPressedRef.current === touch.id) {
                setPlusPressed(null);
                plusPressedRef.current = null;
            }
        }
    }

    return (
        <Box
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: '#543C28',
            }}
            onLoad={setCenters}
        >
            <img src={'./assets/texture.png'} style={{width: '100vw', height: '100vh', position: 'absolute', zIndex: 3, opacity: 0.35}}/>
            <Box
                style={{
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    position: 'absolute',
                    top: 30,
                    gap: 20,
                }}
            >
                <Box
                    style={{
                        width: 'calc(100vw - 100px)',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                    }}
                >
                    <img src={'./assets/minus.png'} alt={'minus'}/>
                    <img src={'./assets/title.png'} alt={'title'} width={103} height={28}/>
                    <img src={'./assets/plus.png'} alt={'plus'}/>
                </Box>
                <img src={'./assets/leave-icon.svg'} alt={'leave'}/>
            </Box>
            <Box style={{display: 'flex', flex: 1}}/>
            <Box
                style={{
                    width: 'calc(100vw - 200px)',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                }}
            >
                <Box
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 76,
                        position: 'relative',
                        width: JOYSTICK_RADIUS * 2,
                        height: JOYSTICK_RADIUS * 2,
                    }}
                >
                    <Box
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            zIndex: 1,
                            top: JOYSTICK_RADIUS - JOYSTICK_THROTTLE_RADIUS - (joystickState.y * MAX_JOYSTICK_DISTANCE / 100),
                            left: JOYSTICK_RADIUS - JOYSTICK_THROTTLE_RADIUS + (joystickState.x * MAX_JOYSTICK_DISTANCE / 100),
                        }}
                    >
                        <Box
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: JOYSTICK_THROTTLE_RADIUS * 2,
                                height: JOYSTICK_THROTTLE_RADIUS * 2,
                            }}
                        >
                            <img src={'./assets/joystick-throttle.png'} alt={'joystick-throttle'}
                                 style={{resizeMode: "cover"}}/>
                        </Box>
                    </Box>
                    <img src={'./assets/joystick-base.png'} alt={'joystick-base'}/>
                </Box>
                <Box style={{
                    display: 'flex',
                    width: 32,
                    height: 140,
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    borderRadius: 100,
                    boxShadow: '0px 0px 10px 0px #000 inset',
                    marginBottom: 100,
                    marginRight: 38,
                }}>
                    <Box style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: percentBoost * 140 / 100,
                        width: 32,
                        borderRadius: 100,
                        background: 'linear-gradient(180deg, #73A04A 0%, #3D4B30 100%)',
                        boxShadow: '0px 0px 10px 0px #000 inset',
                    }}/>
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        marginBottom: 110,
                    }}
                >
                    {
                        fireState.active ?
                            <img src={'./assets/fire-button-pressed.png'} alt={'fire-pressed'} width={208}
                                 height={208}/>
                            :
                            <img src={'./assets/fire-button.png'} alt={'fire'} width={208} height={208}/>
                    }
                </Box>
                {
                    boostPressed !== null ?
                        <img
                            src={'./assets/boost-button-pressed.png'}
                            alt={'boost-pressed'}
                            width={67.7}
                            height={67.7}
                            style={{
                                position: 'absolute',
                                bottom: 91 - BOOST_BUTTON_RADIUS,
                                right: 100 + (FIRE_BUTTON_RADIUS * 2),
                            }}
                        />
                        :
                        <img
                            src={'./assets/boost-button.png'}
                            alt={'boost'}
                            width={67.7}
                            height={67.7}
                            style={{
                                position: 'absolute',
                                bottom: 91 - BOOST_BUTTON_RADIUS,
                                right: 100 + (FIRE_BUTTON_RADIUS * 2),
                            }}
                        />
                }
            </Box>
        </Box>
    );
}

export default App;