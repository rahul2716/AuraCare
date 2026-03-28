import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Meditation.css';

const EXERCISES = {
    GROUNDING: {
        id: 'grounding',
        title: '5-4-3-2-1 Grounding',
        tasks: {
            basic: [
                { count: 5, text: 'Things you can SEE', icon: '👀', color: '#ff6b6b' },
                { count: 4, text: 'Things you can TOUCH', icon: '✋', color: '#feca57' },
                { count: 3, text: 'Things you can HEAR', icon: '👂', color: '#1dd1a1' },
                { count: 2, text: 'Things you can SMELL', icon: '👃', color: '#48dbfb' },
                { count: 1, text: 'Thing you can TASTE', icon: '👅', color: '#5f27cd' },
            ],
            objectFocus: {
                title: 'Object Focus',
                steps: [
                    "Pick one object near you",
                    "What color is it?",
                    "What is its shape?",
                    "How does it feel (texture)?",
                    "Is it warm or cold?"
                ]
            },
            category: [
                "Name 5 Animals 🦁",
                "Name 5 Fruits 🍎",
                "Name 5 Cities 🏙️",
                "Name 5 Colors 🎨"
            ]
        }
    },
    BREATHING: {
        id: 'breathing',
        title: 'Breathing Exercises',
        tasks: {
            box: [
                { phase: 'Inhale', duration: 4, scale: 1.5, instruction: "Breathe in slowly..." },
                { phase: 'Hold', duration: 7, scale: 1.5, instruction: "Hold that breath..." },
                { phase: 'Exhale', duration: 8, scale: 1.0, instruction: "Release slowly..." },
            ],
            touch: [
                { text: "Place one hand on your chest", duration: 5 },
                { text: "Feel the rise and fall", duration: 5 },
                { text: "Count 5 calm breaths", duration: 10 }
            ]
        }
    },
    PHYSICAL: {
        id: 'physical',
        title: 'Physical Connection',
        tasks: [
            { title: "Feet on Floor", text: "Place both feet flat. Press down gently. Feel the ground supporting you." },
            { title: "Temperature Reset", text: "Hold something Cold or Warm. Focus on that sensation for 30 seconds." },
            { title: "Muscle Release", text: "Squeeze your fists tight for 5 seconds... then release." }
        ]
    },
    EMERGENCY: {
        id: 'emergency',
        title: '30-Second Reset',
        steps: [
            "Take 1 BIG slow breath",
            "Look around & name 3 colors",
            "Press your feet into the ground",
            "You are safe."
        ]
    },
    REASSURANCE: {
        id: 'reassurance',
        title: 'Instant Calm',
        scripts: [
            "You are safe right now.",
            "This feeling is temporary.",
            "You have survived 100% of your bad days.",
            "Just focus on this one breath.",
            "You are strong enough to handle this.",
            "You are not in danger.",
            "This feeling will pass."
        ]
    }
};

const GroundingExercise = ({ onComplete }) => {
    const [mode, setMode] = useState('menu'); // menu, basic, object, category
    const [step, setStep] = useState(0);
    const [userInputs, setUserInputs] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [showCompletion, setShowCompletion] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setCurrentInput(transcript);
                setIsListening(false);
            };

            recognitionInstance.onerror = () => {
                setIsListening(false);
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        }
    }, []);

    const startVoiceInput = () => {
        if (recognition) {
            setIsListening(true);
            recognition.start();
        }
    };

    const stopVoiceInput = () => {
        if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
        }
    };

    const renderMenu = () => (
        <div className="sub-menu-grid">
            <button className="sub-menu-btn basic" onClick={() => {
                setMode('basic');
                setStep(0);
                setUserInputs([]);
                setShowCompletion(false);
            }}>
                <span className="btn-icon">🖐️</span>
                <span className="btn-text">Basic 5-4-3-2-1</span>
            </button>
            <button className="sub-menu-btn object" onClick={() => {
                setMode('object');
                setStep(0);
                setUserInputs([]);
                setShowCompletion(false);
            }}>
                <span className="btn-icon">👁️</span>
                <span className="btn-text">Object Focus</span>
            </button>
            <button className="sub-menu-btn category" onClick={() => {
                setMode('category');
                setStep(0);
                setUserInputs([]);
                setShowCompletion(false);
            }}>
                <span className="btn-icon">🧠</span>
                <span className="btn-text">Category Game</span>
            </button>
        </div>
    );

    const renderBasic = () => {
        const currentStep = EXERCISES.GROUNDING.tasks.basic[step];
        const requiredCount = currentStep.count;
        const currentStepInputs = userInputs.filter(input => input.step === step);

        const handleAddInput = () => {
            if (currentInput.trim() && currentStepInputs.length < requiredCount) {
                setUserInputs([...userInputs, { step, value: currentInput.trim() }]);
                setCurrentInput('');
            }
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                handleAddInput();
            }
        };

        const handleNext = () => {
            if (currentStepInputs.length === requiredCount) {
                if (step < 4) {
                    setStep(step + 1);
                    setCurrentInput('');
                } else {
                    // All steps completed
                    setShowCompletion(true);
                }
            }
        };

        const handleRemoveInput = (index) => {
            const globalIndex = userInputs.findIndex((input, i) =>
                input.step === step && userInputs.filter(inp => inp.step === step).indexOf(input) === index
            );
            const newInputs = [...userInputs];
            newInputs.splice(globalIndex, 1);
            setUserInputs(newInputs);
        };

        if (showCompletion) {
            const allCompleted = EXERCISES.GROUNDING.tasks.basic.every((task, idx) =>
                userInputs.filter(input => input.step === idx).length === task.count
            );

            return (
                <motion.div
                    className="grounding-card completion-card"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    {allCompleted ? (
                        <>
                            <div className="completion-icon success">🎉</div>
                            <h2>Amazing Work!</h2>
                            <p className="completion-message">
                                You've successfully completed the 5-4-3-2-1 grounding exercise.
                                You're more present and centered now. Well done!
                            </p>
                            <button className="next-btn" onClick={() => {
                                setMode('menu');
                                setStep(0);
                                setUserInputs([]);
                                setShowCompletion(false);
                            }}>
                                Return to Menu ✨
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="completion-icon retry">😔</div>
                            <h2>Not Quite There Yet</h2>
                            <p className="completion-message">
                                It looks like you haven't completed all the tasks.
                                Please try again and fill in all the required items.
                            </p>
                            <button className="next-btn" onClick={() => {
                                setShowCompletion(false);
                                setStep(0);
                                setUserInputs([]);
                            }}>
                                Try Again 🔄
                            </button>
                        </>
                    )}
                </motion.div>
            );
        }

        return (
            <motion.div
                key={step}
                className="grounding-card interactive-card"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
            >
                <div className="step-icon" style={{ background: currentStep.color }}>{currentStep.icon}</div>
                <h2>Find {currentStep.count} {currentStep.text}</h2>
                <p>Type each item you notice and press Enter or Add</p>

                <div className="input-section">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Enter item ${currentStepInputs.length + 1}/${requiredCount}...`}
                            className="grounding-input"
                            disabled={currentStepInputs.length >= requiredCount}
                        />
                        <button
                            className={`voice-btn ${isListening ? 'listening' : ''}`}
                            onClick={isListening ? stopVoiceInput : startVoiceInput}
                            disabled={currentStepInputs.length >= requiredCount}
                            title="Voice input"
                        >
                            {isListening ? '🔴' : '🎤'}
                        </button>
                        <button
                            className="add-btn"
                            onClick={handleAddInput}
                            disabled={!currentInput.trim() || currentStepInputs.length >= requiredCount}
                        >
                            Add
                        </button>
                    </div>

                    <div className="items-list">
                        {currentStepInputs.map((input, index) => (
                            <motion.div
                                key={index}
                                className="item-chip"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{ borderColor: currentStep.color }}
                            >
                                <span>{input.value}</span>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveInput(index)}
                                >
                                    ×
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="progress-indicator">
                        {currentStepInputs.length}/{requiredCount} items added
                    </div>
                </div>

                <button
                    className="next-btn"
                    onClick={handleNext}
                    disabled={currentStepInputs.length < requiredCount}
                    style={{ opacity: currentStepInputs.length < requiredCount ? 0.5 : 1 }}
                >
                    {step < 4 ? 'Next Step →' : 'Complete Exercise ✨'}
                </button>
            </motion.div>
        );
    };

    const renderObject = () => {
        const steps = EXERCISES.GROUNDING.tasks.objectFocus.steps;
        const currentStepInputs = userInputs.filter(input => input.step === step);

        const handleAddInput = () => {
            if (currentInput.trim() && currentStepInputs.length < 1) {
                setUserInputs([...userInputs, { step, value: currentInput.trim() }]);
                setCurrentInput('');
            }
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                handleAddInput();
            }
        };

        const handleNext = () => {
            if (currentStepInputs.length >= 1) {
                if (step < steps.length - 1) {
                    setStep(step + 1);
                    setCurrentInput('');
                } else {
                    setShowCompletion(true);
                }
            }
        };

        const handleRemoveInput = (index) => {
            const globalIndex = userInputs.findIndex((input, i) =>
                input.step === step && userInputs.filter(inp => inp.step === step).indexOf(input) === index
            );
            const newInputs = [...userInputs];
            newInputs.splice(globalIndex, 1);
            setUserInputs(newInputs);
        };

        if (showCompletion) {
            const allCompleted = steps.every((_, idx) =>
                userInputs.filter(input => input.step === idx).length >= 1
            );

            return (
                <motion.div
                    className="grounding-card completion-card"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    {allCompleted ? (
                        <>
                            <div className="completion-icon success">🎉</div>
                            <h2>Excellent Focus!</h2>
                            <p className="completion-message">
                                You've completed the Object Focus exercise.
                                Your awareness and mindfulness are strengthened!
                            </p>
                            <button className="next-btn" onClick={() => {
                                setMode('menu');
                                setStep(0);
                                setUserInputs([]);
                                setShowCompletion(false);
                            }}>
                                Return to Menu ✨
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="completion-icon retry">😔</div>
                            <h2>Not Quite There Yet</h2>
                            <p className="completion-message">
                                Please complete all the observation steps.
                            </p>
                            <button className="next-btn" onClick={() => {
                                setShowCompletion(false);
                                setStep(0);
                                setUserInputs([]);
                            }}>
                                Try Again 🔄
                            </button>
                        </>
                    )}
                </motion.div>
            );
        }

        return (
            <motion.div
                className="grounding-card interactive-card"
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <h2>👁️ Object Focus</h2>
                <h3>{steps[step]}</h3>

                <div className="input-section">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your answer..."
                            className="grounding-input"
                            disabled={currentStepInputs.length >= 1}
                        />
                        <button
                            className={`voice-btn ${isListening ? 'listening' : ''}`}
                            onClick={isListening ? stopVoiceInput : startVoiceInput}
                            disabled={currentStepInputs.length >= 1}
                            title="Voice input"
                        >
                            {isListening ? '🔴' : '🎤'}
                        </button>
                        <button
                            className="add-btn"
                            onClick={handleAddInput}
                            disabled={!currentInput.trim() || currentStepInputs.length >= 1}
                        >
                            Add
                        </button>
                    </div>

                    <div className="items-list">
                        {currentStepInputs.map((input, index) => (
                            <motion.div
                                key={index}
                                className="item-chip"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{ borderColor: '#54a0ff' }}
                            >
                                <span>{input.value}</span>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveInput(index)}
                                >
                                    ×
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="progress-indicator">
                        {currentStepInputs.length >= 1 ? '✓ Answered' : 'Waiting for answer...'}
                    </div>
                </div>

                <button
                    className="next-btn"
                    onClick={handleNext}
                    disabled={currentStepInputs.length < 1}
                    style={{ opacity: currentStepInputs.length < 1 ? 0.5 : 1 }}
                >
                    {step < steps.length - 1 ? 'Next Question →' : 'Complete Exercise ✨'}
                </button>
            </motion.div>
        );
    };

    const renderCategory = () => {
        const tasks = EXERCISES.GROUNDING.tasks.category;
        const taskName = tasks[step];
        const requiredCount = 5; // Each category requires 5 items
        const currentStepInputs = userInputs.filter(input => input.step === step);

        const handleAddInput = () => {
            if (currentInput.trim() && currentStepInputs.length < requiredCount) {
                setUserInputs([...userInputs, { step, value: currentInput.trim() }]);
                setCurrentInput('');
            }
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                handleAddInput();
            }
        };

        const handleNext = () => {
            if (currentStepInputs.length === requiredCount) {
                if (step < tasks.length - 1) {
                    setStep(step + 1);
                    setCurrentInput('');
                } else {
                    setShowCompletion(true);
                }
            }
        };

        const handleRemoveInput = (index) => {
            const globalIndex = userInputs.findIndex((input, i) =>
                input.step === step && userInputs.filter(inp => inp.step === step).indexOf(input) === index
            );
            const newInputs = [...userInputs];
            newInputs.splice(globalIndex, 1);
            setUserInputs(newInputs);
        };

        if (showCompletion) {
            const allCompleted = tasks.every((_, idx) =>
                userInputs.filter(input => input.step === idx).length === requiredCount
            );

            return (
                <motion.div
                    className="grounding-card completion-card"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    {allCompleted ? (
                        <>
                            <div className="completion-icon success">🎉</div>
                            <h2>Brain Power Activated!</h2>
                            <p className="completion-message">
                                You've completed all the category challenges.
                                Your mind is sharp and focused!
                            </p>
                            <button className="next-btn" onClick={() => {
                                setMode('menu');
                                setStep(0);
                                setUserInputs([]);
                                setShowCompletion(false);
                            }}>
                                Return to Menu ✨
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="completion-icon retry">😔</div>
                            <h2>Not Quite There Yet</h2>
                            <p className="completion-message">
                                Please complete all category challenges with 5 items each.
                            </p>
                            <button className="next-btn" onClick={() => {
                                setShowCompletion(false);
                                setStep(0);
                                setUserInputs([]);
                            }}>
                                Try Again 🔄
                            </button>
                        </>
                    )}
                </motion.div>
            );
        }

        return (
            <motion.div
                className="grounding-card interactive-card"
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <h2>🧠 Brain Games</h2>
                <h3>{taskName}</h3>

                <div className="input-section">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Enter item ${currentStepInputs.length + 1}/${requiredCount}...`}
                            className="grounding-input"
                            disabled={currentStepInputs.length >= requiredCount}
                        />
                        <button
                            className={`voice-btn ${isListening ? 'listening' : ''}`}
                            onClick={isListening ? stopVoiceInput : startVoiceInput}
                            disabled={currentStepInputs.length >= requiredCount}
                            title="Voice input"
                        >
                            {isListening ? '🔴' : '🎤'}
                        </button>
                        <button
                            className="add-btn"
                            onClick={handleAddInput}
                            disabled={!currentInput.trim() || currentStepInputs.length >= requiredCount}
                        >
                            Add
                        </button>
                    </div>

                    <div className="items-list">
                        {currentStepInputs.map((input, index) => (
                            <motion.div
                                key={index}
                                className="item-chip"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{ borderColor: '#ff6b6b' }}
                            >
                                <span>{input.value}</span>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveInput(index)}
                                >
                                    ×
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="progress-indicator">
                        {currentStepInputs.length}/{requiredCount} items added
                    </div>
                </div>

                <button
                    className="next-btn"
                    onClick={handleNext}
                    disabled={currentStepInputs.length < requiredCount}
                    style={{ opacity: currentStepInputs.length < requiredCount ? 0.5 : 1 }}
                >
                    {step < tasks.length - 1 ? 'Next Category →' : 'Complete Exercise ✨'}
                </button>
            </motion.div>
        );
    };

    return (
        <div className="exercise-container">
            {mode === 'menu' && renderMenu()}
            {mode === 'basic' && renderBasic()}
            {mode === 'object' && renderObject()}
            {mode === 'category' && renderCategory()}
            {mode !== 'menu' && !showCompletion && <button className="text-btn" onClick={() => { setMode('menu'); setStep(0); setUserInputs([]); setShowCompletion(false); }}>Change Exercise</button>}
        </div>
    );
};

const BreathingExercise = () => {
    const [mode, setMode] = useState('box'); // box, touch
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [countdown, setCountdown] = useState(5);
    const [isStarted, setIsStarted] = useState(false);
    const { box } = EXERCISES.BREATHING.tasks;
    const currentPhase = box[phaseIndex];

    useEffect(() => {
        if (mode === 'box' && isStarted) {
            setCountdown(currentPhase.duration);

            const countdownInterval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        return currentPhase.duration;
                    }
                    return prev - 1;
                });
            }, 1000);

            const timer = setTimeout(() => {
                setPhaseIndex((prev) => (prev + 1) % box.length);
            }, currentPhase.duration * 1000);

            return () => {
                clearTimeout(timer);
                clearInterval(countdownInterval);
            };
        }
    }, [phaseIndex, mode, currentPhase.duration, isStarted]);

    return (
        <div className="breathing-wrapper">
            <div className="toggle-pill">
                <button className={mode === 'box' ? 'active' : ''} onClick={() => setMode('box')}>Box Breath</button>
                <button className={mode === 'touch' ? 'active' : ''} onClick={() => setMode('touch')}>Start to Calm</button>
            </div>
            <div className="exercise-container">

                {mode === 'box' ? (
                    <div className="breathing-container">
                        <div className="breathing-main">
                            <motion.div
                                className="breathing-circle"
                                animate={{
                                    scale: isStarted ? currentPhase.scale : 1,
                                    borderColor: isStarted && currentPhase.phase === 'Hold' ? '#a29bfe' : '#6c5ce7'
                                }}
                                transition={{ duration: isStarted ? currentPhase.duration : 0.5, ease: "linear" }}
                            >
                                <h3>{isStarted ? currentPhase.phase : '💨'}</h3>
                            </motion.div>
                            <p className="instruction-text">
                                {isStarted ? currentPhase.instruction : 'Inhale 4s · Hold 7s · Exhale 8s'}
                            </p>
                        </div>
                        <div className="timer-display">
                            <div className="timer-circle">
                                <motion.div
                                    className="timer-number"
                                    key={isStarted ? countdown : 'idle'}
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {isStarted ? countdown : '—'}
                                </motion.div>
                            </div>
                            <p className="timer-label">seconds</p>

                            {!isStarted ? (
                                <motion.button
                                    className="start-breathing-btn"
                                    onClick={() => {
                                        setPhaseIndex(0);
                                        setCountdown(box[0].duration);
                                        setIsStarted(true);
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    ▶ Start
                                </motion.button>
                            ) : (
                                <motion.button
                                    className="stop-breathing-btn"
                                    onClick={() => {
                                        setIsStarted(false);
                                        setPhaseIndex(0);
                                        setCountdown(box[0].duration);
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    ⏹ Stop
                                </motion.button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="touch-breathing">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grounding-card">
                            <h2>🖐️ Breath + Touch</h2>
                            <p>Place one hand on your chest.</p>
                            <p>Feel the rise and fall as you breathe slowly.</p>
                            <p>Take 5 deep, slow breaths now.</p>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

const PhysicalExercise = () => {
    const [index, setIndex] = useState(0);
    const task = EXERCISES.PHYSICAL.tasks[index];

    return (
        <div className="exercise-container">
            <motion.div
                key={index}
                className="grounding-card physical-card"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
            >
                <h2>🦶 Physical Reset</h2>
                <h3>{task.title}</h3>
                <p>{task.text}</p>
                <div className="nav-dots">
                    {EXERCISES.PHYSICAL.tasks.map((_, i) => (
                        <span key={i} className={`dot ${i === index ? 'active' : ''}`} />
                    ))}
                </div>
                <button className="next-btn" onClick={() => setIndex((index + 1) % EXERCISES.PHYSICAL.tasks.length)}>
                    Next Technique →
                </button>
            </motion.div>
        </div>
    );
};

const EmergencyReset = () => {
    const [step, setStep] = useState(0);
    const steps = EXERCISES.EMERGENCY.steps;

    useEffect(() => {
        if (step < steps.length) {
            const timer = setTimeout(() => setStep(step + 1), 4000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    return (
        <div className="exercise-container emergency-container">
            <h2 className="emergency-title">⚡ 30-Second Reset</h2>
            <div className="steps-list">
                {steps.map((text, i) => (
                    <motion.div
                        key={i}
                        className={`step-item ${i <= step ? 'visible' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: i <= step ? 1 : 0, y: i <= step ? 0 : 20 }}
                    >
                        <span className="step-num">{i + 1}</span>
                        {text}
                    </motion.div>
                ))}
            </div>
            {step >= steps.length && (
                <motion.button
                    className="next-btn"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setStep(0)} // Reset
                >
                    I'm feeling steadier
                </motion.button>
            )}
        </div>
    );
};

const Meditation = ({ onBack }) => {
    const [activeExercise, setActiveExercise] = useState(null);

    return (
        <motion.div
            className="meditation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 20 }}
        >
            <div className="meditation-header">
                <button className="back-btn" onClick={() => activeExercise ? setActiveExercise(null) : onBack()}>
                    {activeExercise ? '← Back to Menu' : '← Home'}
                </button>
                <h2><span className="gradient-title">Emotional First-Aid</span> 🩹</h2>
            </div>

            {!activeExercise ? (
                <div className="meditation-menu">
                    <h3 className="menu-subtitle">Pick a technique to start healing</h3>
                    <div className="cards-grid">
                        <motion.div
                            className="menu-card"
                            onClick={() => setActiveExercise('grounding')}
                            style={{ background: 'linear-gradient(135deg, #ff9ff3 0%, #feca57 100%)', color: '#2d3436' }}
                        >
                            <span className="card-icon" style={{ color: '#2d3436' }}>🌲</span>
                            <h3>Grounding</h3>
                            <p>5-4-3-2-1 & Brain Games</p>
                        </motion.div>

                        <motion.div
                            className="menu-card"
                            onClick={() => setActiveExercise('breathing')}
                            style={{ background: 'linear-gradient(135deg, #54a0ff 0%, #00d2d3 100%)', color: '#2d3436' }}
                        >
                            <span className="card-icon" style={{ color: '#2d3436' }}>💨</span>
                            <h3>Breathe</h3>
                            <p>Box & Touch Breathing</p>
                        </motion.div>

                        <motion.div
                            className="menu-card"
                            onClick={() => setActiveExercise('physical')}
                            style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%)', color: '#2d3436' }}
                        >
                            <span className="card-icon" style={{ color: '#2d3436' }}>🦶</span>
                            <h3>Body Connect</h3>
                            <p>Reconnect with reality</p>
                        </motion.div>

                        <motion.div
                            className="menu-card full-width"
                            onClick={() => setActiveExercise('emergency')}
                            style={{ background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)', color: 'white' }}
                        >
                            <span className="card-icon" style={{ color: 'white' }}>⚡</span>
                            <h3>Emergency Reset</h3>
                            <p style={{ opacity: 0.9 }}>30-Second Panic Stop</p>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <div className="exercise-area">
                    {activeExercise === 'grounding' && <GroundingExercise onComplete={() => setActiveExercise(null)} />}
                    {activeExercise === 'breathing' && <BreathingExercise />}
                    {activeExercise === 'physical' && <PhysicalExercise />}
                    {activeExercise === 'emergency' && <EmergencyReset />}
                </div>
            )}
        </motion.div>
    );
};

export default Meditation;
