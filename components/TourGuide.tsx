import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, Check, MousePointerClick, Edit3 } from 'lucide-react';

interface TourStep {
  targetId: string | null; 
  path: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  actionHint?: string;
  interaction?: 'click' | null; // If 'click', Tour waits for user to click target
}

const TOUR_STEPS: TourStep[] = [
  // --- INTRO ---
  {
    targetId: null,
    path: '/',
    title: "Welcome to CashBuddy! 🚀",
    content: "I'll train you to become a finance master. We will configure your budget, add a transaction, and set a savings goal together.\n\nLet's do this step-by-step.",
    actionHint: "Click 'Start Tour' to begin."
  },
  {
    targetId: 'dashboard-stats',
    path: '/',
    title: "Your Command Center",
    content: "This dashboard shows your real-time financial health. Right now it might be empty, but we'll fix that.",
    position: 'bottom',
    actionHint: "Let's set up your budget first."
  },
  
  // --- BUDGET SETUP ---
  {
    targetId: 'budget-link-btn', 
    path: '/budget',
    title: "Step 1: The Budget",
    content: "Navigate to the Budget page.",
    position: 'bottom',
    actionHint: "Taking you there..."
  },
  {
    targetId: 'budget-config-btn',
    path: '/budget',
    title: "Open Configuration",
    content: "We need to set your limits. \n\n👉 **Click 'Reconfigure Budget'** to open the form.",
    position: 'bottom',
    interaction: 'click'
  },
  {
    targetId: 'budget-income',
    path: '/budget',
    title: "Enter Income",
    content: "Type your monthly income here (e.g., 50000). This determines your spending power.",
    position: 'top',
    actionHint: "Type amount, then click Next."
  },
  {
    targetId: 'budget-savings',
    path: '/budget',
    title: "Set Savings",
    content: "How much do you want to save? Enter a value or click the 'AI' button to calculate the ideal 20%.",
    position: 'top',
    actionHint: "Fill this, then click Next."
  },
  {
    targetId: 'budget-save-btn',
    path: '/budget',
    title: "Save Budget",
    content: "Great! Now save your plan. \n\n👉 **Click 'Start Budgeting'**.",
    position: 'top',
    interaction: 'click'
  },

  // --- ADD TRANSACTION ---
  {
    targetId: 'tx-add-btn',
    path: '/transactions',
    title: "Step 2: Add Transaction",
    content: "Now let's record an expense manually. \n\n👉 **Click 'Add New'**.",
    position: 'left',
    interaction: 'click'
  },
  {
    targetId: 'tx-type-selector',
    path: '/transactions',
    title: "Select Type",
    content: "Is this money coming in (Income) or going out (Expense)? Default is Expense.",
    position: 'bottom',
    actionHint: "Select type, then Next."
  },
  {
    targetId: 'tx-amount',
    path: '/transactions',
    title: "Enter Amount",
    content: "How much was spent? (e.g., 250).",
    position: 'top',
    actionHint: "Type amount, then Next."
  },
  {
    targetId: 'tx-description',
    path: '/transactions',
    title: "Description",
    content: "What was this for? (e.g., 'Lunch at Cafe').",
    position: 'top',
    actionHint: "Type description, then Next."
  },
  {
    targetId: 'tx-category',
    path: '/transactions',
    title: "Category",
    content: "Categorize it properly (e.g., 'Food') to get accurate reports.",
    position: 'top',
    actionHint: "Select category, then Next."
  },
  {
    targetId: 'tx-save-btn',
    path: '/transactions',
    title: "Save It",
    content: "Looks good! \n\n👉 **Click 'Save Transaction'** to finish.",
    position: 'top',
    interaction: 'click'
  },

  // --- SAVINGS GOAL ---
  {
    targetId: 'savings-add-btn',
    path: '/savings',
    title: "Step 3: Savings Goals",
    content: "Let's set a goal for something you want to buy. \n\n👉 **Click 'New Goal'**.",
    position: 'left',
    interaction: 'click'
  },
  {
    targetId: 'savings-name',
    path: '/savings',
    title: "Goal Name",
    content: "What are you saving for? (e.g., 'New Phone').",
    position: 'top',
    actionHint: "Type name, then Next."
  },
  {
    targetId: 'savings-target',
    path: '/savings',
    title: "Target Amount",
    content: "How much do you need? (e.g., 50000).",
    position: 'top',
    actionHint: "Type amount, then Next."
  },
  {
    targetId: 'savings-create-btn',
    path: '/savings',
    title: "Create Goal",
    content: "Almost done! \n\n👉 **Click 'Create Goal'**.",
    position: 'top',
    interaction: 'click'
  },

  // --- OUTRO ---
  {
    targetId: 'chatbot-trigger',
    path: '/',
    title: "You're Ready! 🎉",
    content: "You now know the basics. \n\nOne last tip: Use the **AI Chatbot** here if you ever feel lazy. You can just tell it 'Add expense 500 for food' and it will do the work for you!",
    position: 'top',
    actionHint: "Enjoy CashBuddy!"
  }
];

interface TourGuideProps {
  isActive: boolean;
  onClose: () => void;
}

const TourGuide: React.FC<TourGuideProps> = ({ isActive, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const listenerAttachedRef = useRef<HTMLElement | null>(null);

  const step = TOUR_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  // Cleanup listeners
  useEffect(() => {
     return () => {
         if (listenerAttachedRef.current) {
             listenerAttachedRef.current = null;
         }
     }
  }, [currentStepIndex]);

  // Navigation and Element Discovery Logic
  useEffect(() => {
    if (!isActive) return;

    const findTarget = () => {
      if (!step.targetId) {
        setTargetRect(null);
        setIsLocating(false);
        return;
      }

      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
           setTargetRect(rect);
           setIsLocating(false);
           el.scrollIntoView({ behavior: 'smooth', block: 'center' });
           
           if (step.interaction === 'click' && listenerAttachedRef.current !== el) {
               const clickHandler = () => {
                   setTimeout(() => handleNext(), 500);
               };
               el.addEventListener('click', clickHandler, { once: true });
               listenerAttachedRef.current = el;
           }
           return;
        }
      }
      setIsLocating(true);
    };

    if (location.pathname !== step.path) {
      setIsLocating(true);
      navigate(step.path);
    } else {
      findTarget();
      const interval = setInterval(findTarget, 500);
      return () => clearInterval(interval);
    }

  }, [currentStepIndex, isActive, step, location.pathname, navigate]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
        if (step.targetId) {
            const el = document.getElementById(step.targetId);
            if (el) setTargetRect(el.getBoundingClientRect());
        }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
    };
  }, [step]);

  if (!isActive) return null;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
      setTimeout(() => setCurrentStepIndex(0), 500);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  };

  const handleSkip = () => {
    onClose();
    setTimeout(() => setCurrentStepIndex(0), 500);
  };

  // --- Render Helpers ---
  const renderOverlay = () => {
    if (!targetRect) {
      return <div className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm transition-all duration-500" />;
    }

    const pulseClass = step.interaction === 'click' ? 'animate-pulse' : '';

    return (
      <div 
        className={`fixed z-[60] transition-all duration-300 ease-in-out pointer-events-none rounded-lg ${pulseClass}`}
        style={{
          top: targetRect.top - 5,
          left: targetRect.left - 5,
          width: targetRect.width + 10,
          height: targetRect.height + 10,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
          border: step.interaction === 'click' ? '2px solid #10b981' : 'none'
        }}
      />
    );
  };

  const renderCard = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 768;
    
    const baseStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 70,
        width: isMobile ? 'calc(100% - 32px)' : '350px',
        maxWidth: '400px',
        margin: isMobile ? '0 16px' : '0',
    };

    let posStyle: React.CSSProperties = {};
    let arrowStyle: React.CSSProperties = {};
    let arrowClass = '';

    if (!targetRect) {
        posStyle = {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            margin: 0
        };
    } else {
        const gap = 16;
        if (isMobile) {
            const targetCenterY = targetRect.top + (targetRect.height / 2);
            if (targetCenterY > viewportHeight / 2) {
                posStyle = { top: 20, left: 0, right: 0 };
            } else {
                posStyle = { bottom: 20, left: 0, right: 0 };
            }
        } else {
            const stepPos = step.position || 'bottom';
            const cardWidth = 350; 
            let left = targetRect.left + (targetRect.width / 2) - (cardWidth / 2);
            
            if (left < 20) left = 20;
            if (left + cardWidth > viewportWidth - 20) left = viewportWidth - cardWidth - 20;

            if (stepPos === 'top') {
                posStyle = { bottom: viewportHeight - targetRect.top + gap, left: left };
                arrowClass = 'border-t-white border-l-transparent border-r-transparent border-b-transparent';
                arrowStyle = { bottom: -14, left: targetRect.left - left + (targetRect.width/2) - 8 }; 
            } else if (stepPos === 'bottom') {
                posStyle = { top: targetRect.bottom + gap, left: left };
                arrowClass = 'border-b-white border-l-transparent border-r-transparent border-t-transparent';
                arrowStyle = { top: -14, left: targetRect.left - left + (targetRect.width/2) - 8 };
            } else if (stepPos === 'left') {
                posStyle = { top: Math.max(20, targetRect.top), right: viewportWidth - targetRect.left + gap };
                arrowClass = 'border-l-white border-t-transparent border-b-transparent border-r-transparent';
                arrowStyle = { top: 20, right: -14 };
            } else if (stepPos === 'right') {
                posStyle = { top: Math.max(20, targetRect.top), left: targetRect.right + gap };
                arrowClass = 'border-r-white border-t-transparent border-b-transparent border-l-transparent';
                arrowStyle = { top: 20, left: -14 };
            }
        }
    }

    return (
      <div 
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl animate-fade-in transition-all duration-300 border border-slate-100 dark:border-slate-700"
        style={{ ...baseStyle, ...posStyle }}
      >
        {targetRect && !isMobile && (
             <div className={`absolute w-0 h-0 border-[8px] ${arrowClass}`} style={arrowStyle} />
        )}

        <div className="flex justify-between items-start mb-4">
             <div className="flex items-center space-x-2">
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">
                    {currentStepIndex + 1} / {TOUR_STEPS.length}
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{step.title}</h3>
             </div>
             <button onClick={handleSkip} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
             </button>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-4">
            {step.content}
        </p>

        {step.interaction === 'click' ? (
             <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg mb-6 flex items-start space-x-2 animate-pulse">
                <div className="mt-0.5"><MousePointerClick size={14} className="text-emerald-600 dark:text-emerald-400" /></div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold italic">
                    Click the highlighted button to continue...
                </p>
             </div>
        ) : step.actionHint && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg mb-6 flex items-start space-x-2">
                <div className="mt-0.5"><Edit3 size={14} className="text-indigo-600 dark:text-indigo-400" /></div>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium italic">
                    {step.actionHint}
                </p>
            </div>
        )}

        <div className="flex justify-between items-center">
            <button 
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className={`text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium ${currentStepIndex === 0 ? 'invisible' : ''}`}
            >
                Back
            </button>
            
            {step.interaction !== 'click' && (
                <button 
                    onClick={handleNext}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none flex items-center space-x-1"
                >
                    <span>Next Step</span>
                    {!isLastStep && <ChevronRight size={16} />}
                </button>
            )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderOverlay()}
      {renderCard()}
    </>
  );
};

export default TourGuide;