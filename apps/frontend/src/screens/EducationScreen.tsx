import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { topoSort, Concept, CURRICULUM, ELECTION_TIMELINE } from '@votexa/algorithms';

const { width } = Dimensions.get('window');

// ============================================================================
// SUB-COMPONENTS (PORTED TO REACT NATIVE)
// ============================================================================

function ConceptCard({ concept, isCompleted, onClick }: { concept: any, isCompleted: boolean, onClick: () => void }) {
  return (
    <TouchableOpacity
      onPress={onClick}
      className={`p-4 rounded-2xl border-2 mb-3 flex-row items-center justify-between shadow-sm ${
        isCompleted
          ? 'border-emerald-500 bg-emerald-900/10'
          : 'border-gray-700 bg-gray-800'
      }`}
    >
      <View className="flex-1">
        <Text className={`font-black text-base mb-1 ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>
          {concept.title}
        </Text>
        <Text className="text-xs text-gray-400" numberOfLines={2}>{concept.description}</Text>
        <View className="flex-row mt-3">
          <View className={`px-2 py-1 rounded mr-2 ${
            concept.difficulty <= 1 ? 'bg-emerald-900/40' :
            concept.difficulty <= 2 ? 'bg-yellow-900/40' : 'bg-red-900/40'
          }`}>
            <Text className="text-[10px] font-bold text-gray-300">{'⭐'.repeat(concept.difficulty)}</Text>
          </View>
          <View className="px-2 py-1 bg-indigo-900/40 rounded">
            <Text className="text-[10px] font-bold text-indigo-400">{concept.time}s</Text>
          </View>
        </View>
      </View>
      <View className="ml-4">
        <Text className="text-2xl">{isCompleted ? '✅' : '○'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function QuizComponent({ concept, onSubmit }: { concept: any, onSubmit: (score: number) => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const questions = [
    {
      question: `What is the main topic of "${concept.title}"?`,
      options: [concept.description, 'Basic voting protocols', 'Regional security', 'Ballot encryption'],
      correct: 0
    },
    {
      question: `Which of these is a key point for "${concept.title}"?`,
      options: concept.keyPoints,
      correct: 0
    },
    {
      question: `How long does learning "${concept.title}" typically take?`,
      options: [
        `${concept.time} seconds`,
        `${concept.time * 2} seconds`,
        `${concept.time / 2} seconds`,
        `${concept.time * 3} seconds`
      ],
      correct: 0
    }
  ];

  const handleAnswer = (selectedIdx: number) => {
    if (selectedIdx === questions[currentQuestion].correct) {
      setScore(s => s + 33.4);
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    const finalScore = Math.round(score);
    return (
      <View className="mt-6 p-6 bg-gray-800 border border-gray-700 rounded-3xl items-center shadow-2xl">
        <Text className="text-2xl font-black text-white mb-2">Quiz Complete! 🎉</Text>
        <Text className={`text-4xl font-black mb-4 ${finalScore > 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>
          {finalScore}%
        </Text>
        <TouchableOpacity
          onPress={() => onSubmit(finalScore)}
          className={`px-8 py-4 rounded-2xl ${finalScore > 80 ? 'bg-emerald-600' : 'bg-indigo-600'}`}
        >
          <Text className="text-white font-black">{finalScore > 80 ? 'Mark as Complete' : 'Try Again'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = questions[currentQuestion];

  return (
    <View className="mt-6 p-6 bg-gray-800 border border-gray-700 rounded-3xl shadow-xl">
      <View className="mb-6">
        <Text className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
          Question {currentQuestion + 1} of {questions.length}
        </Text>
        <View className="w-full bg-gray-900 h-1 rounded-full mt-2">
          <View
            className="bg-indigo-500 h-1 rounded-full"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </View>
      </View>

      <Text className="text-lg font-bold text-white mb-6">{question.question}</Text>

      <View className="gap-y-3">
        {question.options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleAnswer(idx)}
            className="w-full p-4 rounded-2xl border-2 border-gray-700 bg-gray-900 active:bg-gray-700"
          >
            <Text className="text-white font-bold text-sm">
              {String.fromCharCode(65 + idx)}) {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EducationScreen() {
  const [completedConcepts, setCompletedConcepts] = useState(new Set<string>());
  const [currentConcept, setCurrentConcept] = useState<any>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [activeTab, setActiveTab] = useState('concepts');

  // Generate Learning Path using the topological sort algorithm
  const learningPath = useMemo(() => {
    const deps: [string, string][] = [];
    CURRICULUM.forEach(c => {
      c.prerequisites.forEach(p => deps.push([p, c.id]));
    });
    return topoSort(CURRICULUM.map(c => ({ id: c.id } as Concept)), deps);
  }, []);

  const nextRecommended = useMemo(() => {
    for (const conceptId of learningPath) {
      if (!completedConcepts.has(conceptId)) {
        return CURRICULUM.find(c => c.id === conceptId);
      }
    }
    return null;
  }, [completedConcepts, learningPath]);

  const progressPercent = useMemo(() => {
    return Math.round((completedConcepts.size / CURRICULUM.length) * 100);
  }, [completedConcepts]);

  const completeConcept = useCallback((conceptId: string) => {
    setCompletedConcepts(prev => new Set([...prev, conceptId]));
    setQuizMode(false);
  }, []);

  const submitQuiz = useCallback((score: number) => {
    if (score > 80) {
      completeConcept(currentConcept.id);
    } else {
      setQuizMode(false);
    }
  }, [currentConcept, completeConcept]);

  return (
    <ScrollView 
      className="flex-1 bg-gray-900"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 }}
    >
      {/* Header */}
      <View className="mb-8">
        <Text className="text-3xl font-black text-white">Election Master</Text>
        <Text className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Votexa Intelligence Academy</Text>
      </View>

      {/* Progress & Recommendations Summary */}
      <View className="bg-gray-800 p-6 rounded-3xl border border-gray-700 mb-8 shadow-xl">
        <View className="flex-row justify-between items-end mb-4">
          <View>
            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Your Progress</Text>
            <Text className="text-white text-3xl font-black">{progressPercent}%</Text>
          </View>
          <Text className="text-gray-500 font-bold text-xs">{completedConcepts.size} / {CURRICULUM.length} Concepts</Text>
        </View>
        <View className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
          <View
            className="bg-indigo-500 h-full rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-gray-800 rounded-2xl p-1 mb-8">
        {[
          { id: 'concepts', label: 'Concepts', icon: '📚' },
          { id: 'timeline', label: 'Timeline', icon: '📅' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 items-center rounded-xl ${
              activeTab === tab.id ? 'bg-indigo-600 shadow-lg' : 'bg-transparent'
            }`}
          >
            <Text className={`font-black text-xs ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>
              {tab.icon} {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recommended Next (If in concepts tab and not studying) */}
      {activeTab === 'concepts' && !currentConcept && nextRecommended && (
        <View className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-3xl mb-8">
          <Text className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">⭐ Recommended Next</Text>
          <Text className="text-white font-black text-xl mb-1">{nextRecommended.title}</Text>
          <Text className="text-gray-400 text-xs mb-4">{nextRecommended.description}</Text>
          <TouchableOpacity
            onPress={() => setCurrentConcept(nextRecommended)}
            className="bg-indigo-600 py-3 rounded-2xl items-center shadow-lg"
          >
            <Text className="text-white font-black">Start Learning →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content Area */}
      {activeTab === 'concepts' && (
        <View>
          {currentConcept ? (
            <View className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
              <TouchableOpacity onPress={() => setCurrentConcept(null)} className="mb-4">
                <Text className="text-indigo-400 font-bold text-xs">← Back to path</Text>
              </TouchableOpacity>
              
              <Text className="text-white font-black text-2xl mb-2">{currentConcept.title}</Text>
              <Text className="text-gray-400 mb-6">{currentConcept.description}</Text>

              <View className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700 mb-6">
                <Text className="text-white text-sm leading-6 mb-4">{currentConcept.content}</Text>
                <Text className="text-indigo-400 font-black text-[10px] uppercase mb-2">Key Learning Points</Text>
                {currentConcept.keyPoints.map((p: string, i: number) => (
                  <View key={i} className="flex-row items-center mb-1">
                    <Text className="text-emerald-500 mr-2 font-black">✓</Text>
                    <Text className="text-gray-400 text-xs">{p}</Text>
                  </View>
                ))}
              </View>

              {!completedConcepts.has(currentConcept.id) ? (
                <TouchableOpacity
                  onPress={() => setQuizMode(true)}
                  className="bg-emerald-600 py-4 rounded-2xl items-center shadow-lg"
                >
                  <Text className="text-white font-black">Take Certification Quiz →</Text>
                </TouchableOpacity>
              ) : (
                <View className="bg-emerald-900/20 py-4 rounded-2xl items-center border border-emerald-500/30">
                  <Text className="text-emerald-400 font-black">✓ Concept Mastered</Text>
                </View>
              )}

              {quizMode && <QuizComponent concept={currentConcept} onSubmit={submitQuiz} />}
            </View>
          ) : (
            <View>
              <Text className="text-white font-black text-lg mb-4">Learning Curriculum</Text>
              {CURRICULUM.map(concept => (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  isCompleted={completedConcepts.has(concept.id)}
                  onClick={() => setCurrentConcept(concept)}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Timeline View */}
      {activeTab === 'timeline' && (
        <View className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
          <Text className="text-white font-black text-lg mb-6">Election Roadmap</Text>
          {ELECTION_TIMELINE.phases.map((phase, idx) => (
            <View key={idx} className="mb-6 flex-row items-start">
              <View className="items-center mr-4">
                <View className={`w-3 h-3 rounded-full mt-1 ${phase.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                {idx < ELECTION_TIMELINE.phases.length - 1 && <View className="w-[1px] h-20 bg-gray-700 mt-1" />}
              </View>
              <View className="flex-1 bg-gray-900 p-4 rounded-2xl border border-gray-700">
                <View className="flex-row justify-between">
                  <Text className="text-white font-black text-base">{phase.name}</Text>
                  <Text className={`text-[10px] font-black uppercase ${phase.status === 'completed' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                    {phase.status}
                  </Text>
                </View>
                <Text className="text-gray-500 text-xs font-bold mt-1">{phase.date}</Text>
                <Text className="text-gray-400 text-xs mt-2" numberOfLines={1}>{phase.states.join(', ')}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
