import { useEffect, useState } from 'react';
import LanguageSwitcher from './components/survey/LanguageSwitcher.jsx';
import { RelationshipContext } from './components/survey/RelationshipContext.js';
import ProgressBar from './components/survey/ProgressBar.jsx';
import AssignedInfoScreen from './components/survey/screens/AssignedInfoScreen.jsx';
import BaselineScreen from './components/survey/screens/BaselineScreen.jsx';
import ChainIntroScreen from './components/survey/screens/ChainIntroScreen.jsx';
import CompareCDScreen from './components/survey/screens/CompareCDScreen.jsx';
import CompletionScreen from './components/survey/screens/CompletionScreen.jsx';
import ConsentScreen from './components/survey/screens/ConsentScreen.jsx';
import Hop1Screen from './components/survey/screens/Hop1Screen.jsx';
import Hop2Screen from './components/survey/screens/Hop2Screen.jsx';
import Hop3Screen from './components/survey/screens/Hop3Screen.jsx';
import JudgmentScreen from './components/survey/screens/JudgmentScreen.jsx';
import OpenReasonScreen from './components/survey/screens/OpenReasonScreen.jsx';
import PersonRelationScreen from './components/survey/screens/PersonRelationScreen.jsx';
import RealismScreen from './components/survey/screens/RealismScreen.jsx';
import SensitivityScreen from './components/survey/screens/SensitivityScreen.jsx';
import {
  getProgress,
  getRoundNumber,
  getRoundStep,
  getScreenMeta,
  SCREEN_IDS,
  SUBMIT_SCREEN_ID,
} from './config/screens.js';
import { getInformationItem, SCENARIOS_PER_PARTICIPANT } from './config/study.js';
import {
  applyAssignment,
  buildSubmissionPayload,
  clearSession,
  createSession,
  DEMO_MODE,
  getRound,
  isAssignmentComplete,
  loadSession,
  markScreenTransition,
  requestItemAssignment,
  saveDraft,
  saveSession,
  submitSession,
  updateRound,
} from './lib/surveyStorage.js';
import { validateScreen } from './lib/surveyValidation.js';
import { useLanguage } from './i18n/LanguageContext.jsx';

const TEXT = {
  assignFailed: {
    en: 'Could not load the information for your scenario (the server did not respond). Please try again.',
    zh: '未能获取情境信息（服务器没有响应），请重试。',
  },
  demoBanner: {
    en: 'Demo version — responses are not saved to a server.',
    zh: '演示版——回答不会保存到服务器。',
  },
};

function App() {
  const { lang, t } = useLanguage();
  const [session, setSession] = useState(() => loadSession() ?? createSession());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [assignAttempt, setAssignAttempt] = useState(0);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  // Assign this participant's items and relationship structure once; the stored
  // assignment survives refresh and is never redrawn.
  useEffect(() => {
    let cancelled = false;

    async function ensureAssignment() {
      if (isAssignmentComplete(session)) return;
      if (assigning) return;
      setAssigning(true);
      setAssignError(null);
      try {
        const assignment = await requestItemAssignment(session.participant_id);
        if (cancelled) return;
        setSession((prev) =>
          isAssignmentComplete(prev) ? prev : applyAssignment(prev, assignment),
        );
      } catch (error) {
        console.error(error);
        if (!cancelled) setAssignError(TEXT.assignFailed);
      } finally {
        if (!cancelled) setAssigning(false);
      }
    }

    ensureAssignment();
    return () => {
      cancelled = true;
    };
    // Only run on mount / participant change / explicit retry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.participant_id, assignAttempt]);

  // Moving to another screen without a complete assignment (e.g. the server was down at page load): try again.
  useEffect(() => {
    if (
      !['consent', 'completion'].includes(session.currentScreen) &&
      !isAssignmentComplete(session)
    ) {
      setAssignAttempt((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.currentScreen]);

  const screenId = session.currentScreen;
  const screenMeta = getScreenMeta(screenId);
  const progress = getProgress(screenId);
  const roundStep = getRoundStep(screenId);
  // Person pages sit inside scenario 1 and show its item.
  const activeRound = getRoundNumber(screenId) ?? 1;
  const scenario = getRound(session, activeRound);
  const itemId = scenario?.information_item_id ?? null;
  const scenarioLabel =
    SCENARIOS_PER_PARTICIPANT > 1
      ? {
          en: `Scenario ${activeRound} of ${SCENARIOS_PER_PARTICIPANT}`,
          zh: `情境 ${activeRound} / ${SCENARIOS_PER_PARTICIPANT}`,
        }
      : null;

  function clearError(key) {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function updateAnswer(key, value) {
    clearError(key);
    setSession((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [key]: value,
      },
    }));
  }

  function updateHopField(hopKey, field, value) {
    clearError(field);
    setSession((prev) =>
      updateRound(prev, activeRound, (round) => ({
        ...round,
        [hopKey]: {
          ...round[hopKey],
          [field]: value,
        },
      })),
    );
  }

  function updateScenarioField(field, value) {
    clearError(field);
    setSession((prev) => updateRound(prev, activeRound, { [field]: value }));
  }

  function goTo(nextScreen) {
    setErrors({});
    setSession((prev) =>
      markScreenTransition(prev, prev.currentScreen, nextScreen),
    );
  }

  function handleBack() {
    const index = SCREEN_IDS.indexOf(screenId);
    if (index <= 0) return;
    goTo(SCREEN_IDS[index - 1]);
  }

  function handleRestart() {
    clearSession();
    setErrors({});
    setSubmitResult(null);
    setSession(createSession());
  }

  async function handleNext() {
    const result = validateScreen(session, screenId);
    if (!result.ok) {
      setErrors(result.errors);
      requestAnimationFrame(() => {
        document
          .querySelector('.app-main .error-text')
          ?.closest('.compact-likert, .likert-block, .mc-block, .field-label, .consent-section, .checkbox-group')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    if (screenId === SUBMIT_SCREEN_ID) {
      if (session.submitted || submitting) return;
      setSubmitting(true);

      const payload = { ...buildSubmissionPayload(session), survey_language: lang };
      let response;
      try {
        response = await submitSession(payload);
      } catch {
        response = { ok: false, status: 0, body: null };
      }
      setSubmitResult(response);

      setSession((prev) => ({
        ...prev,
        status: 'completed',
        completed_at: payload.completed_at,
        duration_seconds: payload.duration_seconds,
        screen_end_times: payload.screen_end_times,
        submitted: true,
        currentScreen: 'completion',
      }));
      setSubmitting(false);
      return;
    }

    let current = session;
    if (roundStep === 'info') {
      // Save the item text exactly as displayed (in the current language).
      const item = getInformationItem(itemId);
      current = updateRound(current, activeRound, {
        information_item_text: item ? t(item) : null,
        information_item_language: lang,
      });
    }

    const index = SCREEN_IDS.indexOf(screenId);
    const nextId = SCREEN_IDS[index + 1];
    const nextSession = markScreenTransition(current, screenId, nextId);
    setSession(nextSession);
    setErrors({});
    saveDraft(nextSession);
  }

  const answerCommon = {
    answers: session.answers,
    onChange: updateAnswer,
    onBack: handleBack,
    onNext: handleNext,
    errors,
  };

  const scenarioCommon = {
    itemId,
    onBack: handleBack,
    onNext: handleNext,
  };

  let screen = null;
  switch (roundStep ?? screenId) {
    case 'consent':
      screen = <ConsentScreen {...answerCommon} />;
      break;
    case 'chain_intro':
      screen = <ChainIntroScreen onBack={handleBack} onNext={handleNext} />;
      break;
    case 'baseline':
      screen = <BaselineScreen {...answerCommon} />;
      break;
    case 'info':
      screen = (
        <AssignedInfoScreen
          {...scenarioCommon}
          scenarioLabel={scenarioLabel}
          loading={assigning}
          assignError={isAssignmentComplete(session) ? null : assignError}
          onRetryAssign={() => setAssignAttempt((n) => n + 1)}
          errors={errors}
        />
      );
      break;
    case 'sensitivity':
      screen = (
        <SensitivityScreen
          {...scenarioCommon}
          sensitivityRaw={scenario?.sensitivity_raw}
          onChangeSensitivity={(value) => updateScenarioField('sensitivity_raw', value)}
          errors={errors}
        />
      );
      break;
    case 'person_b':
    case 'person_c':
    case 'person_d':
      screen = (
        <PersonRelationScreen
          {...answerCommon}
          person={screenId.slice(-1).toUpperCase()}
          itemId={itemId}
          relationship={session.relationship_assignment}
        />
      );
      break;
    case 'hop1':
      screen = (
        <Hop1Screen
          {...scenarioCommon}
          hop={scenario?.hop1}
          onChangeHop={(field, value) => updateHopField('hop1', field, value)}
          errors={errors}
        />
      );
      break;
    case 'hop2':
      screen = (
        <Hop2Screen
          {...scenarioCommon}
          hop={scenario?.hop2}
          onChangeHop={(field, value) => updateHopField('hop2', field, value)}
          errors={errors}
        />
      );
      break;
    case 'hop3':
      screen = (
        <Hop3Screen
          {...scenarioCommon}
          hop={scenario?.hop3}
          onChangeHop={(field, value) => updateHopField('hop3', field, value)}
          errors={errors}
        />
      );
      break;
    case 'hop2_reason':
    case 'hop3_reason': {
      const isC = roundStep === 'hop2_reason';
      const field = isC ? 'reason_abc_open' : 'reason_abcd_open';
      screen = (
        <OpenReasonScreen
          key={screenId}
          {...scenarioCommon}
          target={isC ? 'C' : 'D'}
          rating={isC ? scenario?.hop2?.acceptability : scenario?.hop3?.acceptability}
          value={scenario?.[field]}
          onChange={(value) => updateScenarioField(field, value)}
          error={errors[field]}
        />
      );
      break;
    }
    case 'cd_compare':
      screen = (
        <CompareCDScreen
          {...scenarioCommon}
          ratingC={scenario?.hop2?.acceptability}
          ratingD={scenario?.hop3?.acceptability}
          value={scenario?.reason_c_d_difference_open}
          onChange={(value) => updateScenarioField('reason_c_d_difference_open', value)}
          error={errors.reason_c_d_difference_open}
        />
      );
      break;
    case 'judgment_factors':
    case 'judgment_basis':
      screen = (
        <JudgmentScreen
          key={screenId}
          {...scenarioCommon}
          part={roundStep === 'judgment_factors' ? 'factors' : 'basis'}
          round={scenario}
          onChangeRound={updateScenarioField}
          errors={errors}
        />
      );
      break;
    case 'realism':
      screen = (
        <RealismScreen
          {...scenarioCommon}
          value={scenario?.scenario_realism}
          onChange={(value) => updateScenarioField('scenario_realism', value)}
          error={errors.scenario_realism}
          submitting={submitting}
          isLast={screenId === SUBMIT_SCREEN_ID}
        />
      );
      break;
    case 'completion':
      screen = (
        <CompletionScreen
          participantId={session.participant_id}
          submitResult={submitResult}
          demoMode={DEMO_MODE}
          session={session}
          onRestart={handleRestart}
        />
      );
      break;
    default:
      screen = <ConsentScreen {...answerCommon} />;
  }

  return (
    <div className="app-shell">
      <LanguageSwitcher />
      {DEMO_MODE ? <div className="demo-banner">{t(TEXT.demoBanner)}</div> : null}
      {screenId !== 'completion' ? (
        <ProgressBar
          progress={progress}
          label={{
            en: `Step ${screenMeta.index + 1} of ${SCREEN_IDS.length}: ${screenMeta.label.en}`,
            zh: `第 ${screenMeta.index + 1} / ${SCREEN_IDS.length} 步：${screenMeta.label.zh}`,
          }}
        />
      ) : null}
      <RelationshipContext.Provider value={session.relationship_assignment ?? null}>
        <main className="app-main" key={screenId}>{screen}</main>
      </RelationshipContext.Provider>
    </div>
  );
}

export default App;
