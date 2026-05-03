import React from "react";
import { Composition } from "remotion";
import { ChickenRabbitRemotionVideo, type ChickenRabbitRemotionProps } from "./videos/chicken-rabbit-remotion-video";
import {
  GenericKnowledgePointRemotionVideo,
  type GenericKnowledgePointRemotionProps
} from "./videos/generic-knowledge-point-remotion-video";
import { LogicTableRemotionVideo, type LogicTableRemotionProps } from "./videos/logic-table-remotion-video";
import { SumDifferenceRemotionVideo, type SumDifferenceRemotionProps } from "./videos/sum-difference-remotion-video";
import {
  TravelBlackboardVideo,
  RelationWordProblemVideo,
  CalculationBlackboardVideo,
  PatternSequenceVideo,
  GeometryMeasureVideo,
  GeometryConstructionVideo,
  NumberTheoryVideo,
  LogicCountingVideo,
  type TeacherBlackboardRemotionProps
} from "./videos/teacher-family-videos";

const FPS = 30;

export const RemotionRoot = () => {
  const sharedMetadata = ({ props }: { props: Record<string, unknown> }) => {
    const castProps = props as unknown as
      | ChickenRabbitRemotionProps
      | SumDifferenceRemotionProps
      | TeacherBlackboardRemotionProps;
    const durationInFrames = castProps.timing ? Math.ceil((castProps.timing.audioDurationSec + 0.8) * FPS) : FPS * 240;
    return { durationInFrames };
  };

  return (
    <>
      <Composition
        id="logic-table-lecture"
        component={LogicTableRemotionVideo as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        fps={FPS}
        durationInFrames={FPS * 240}
        defaultProps={{
          lesson: null,
          timing: null,
          audioFileRelativePath: "media/knowledge-points/2050101-demo/lecture.mp3"
        } as LogicTableRemotionProps}
        calculateMetadata={sharedMetadata}
      />
      <Composition
        id="generic-knowledge-point-lecture"
        component={GenericKnowledgePointRemotionVideo as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        fps={FPS}
        durationInFrames={FPS * 240}
        defaultProps={{
          lesson: null,
          timing: null,
          audioFileRelativePath: "media/knowledge-points/2050101-demo/lecture.mp3"
        } as GenericKnowledgePointRemotionProps}
        calculateMetadata={sharedMetadata}
      />
      <Composition
        id="travel-blackboard-lecture"
        component={TravelBlackboardVideo as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        fps={FPS}
        durationInFrames={FPS * 240}
        defaultProps={{
          lesson: null,
          timing: null,
          audioFileRelativePath: "media/knowledge-points/6030105-demo/lecture.mp3"
        } as TeacherBlackboardRemotionProps}
        calculateMetadata={sharedMetadata}
      />
      <Composition
        id="relation-word-problem-lecture"
        component={RelationWordProblemVideo as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        fps={FPS}
        durationInFrames={FPS * 240}
        defaultProps={{
          lesson: null,
          timing: null,
          audioFileRelativePath: "media/knowledge-points/6030105-demo/lecture.mp3"
        } as TeacherBlackboardRemotionProps}
        calculateMetadata={sharedMetadata}
      />
      <Composition
        id="calculation-blackboard-lecture"
        component={CalculationBlackboardVideo as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        fps={FPS}
        durationInFrames={FPS * 240}
        defaultProps={{
          lesson: null,
          timing: null,
          audioFileRelativePath: "media/knowledge-points/6030105-demo/lecture.mp3"
        } as TeacherBlackboardRemotionProps}
        calculateMetadata={sharedMetadata}
      />
      <Composition
        id="pattern-sequence-lecture"
        component={PatternSequenceVideo as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        fps={FPS}
        durationInFrames={FPS * 240}
        defaultProps={{
          lesson: null,
          timing: null,
          audioFileRelativePath: "media/knowledge-points/6030105-demo/lecture.mp3"
        } as TeacherBlackboardRemotionProps}
        calculateMetadata={sharedMetadata}
      />
      <Composition
        id="geometry-measure-lecture"
        component={GeometryMeasureVideo as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        fps={FPS}
        durationInFrames={FPS * 240}
        defaultProps={{
          lesson: null,
          timing: null,
          audioFileRelativePath: "media/knowledge-points/6030105-demo/lecture.mp3"
        } as TeacherBlackboardRemotionProps}
        calculateMetadata={sharedMetadata}
      />
      <Composition
        id="geometry-construction-lecture"
        component={GeometryConstructionVideo as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        fps={FPS}
        durationInFrames={FPS * 240}
        defaultProps={{
          lesson: null,
          timing: null,
          audioFileRelativePath: "media/knowledge-points/6030105-demo/lecture.mp3"
        } as TeacherBlackboardRemotionProps}
        calculateMetadata={sharedMetadata}
      />
      <Composition
        id="number-theory-lecture"
        component={NumberTheoryVideo as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        fps={FPS}
        durationInFrames={FPS * 240}
        defaultProps={{
          lesson: null,
          timing: null,
          audioFileRelativePath: "media/knowledge-points/6030105-demo/lecture.mp3"
        } as TeacherBlackboardRemotionProps}
        calculateMetadata={sharedMetadata}
      />
      <Composition
        id="logic-counting-lecture"
        component={LogicCountingVideo as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        fps={FPS}
        durationInFrames={FPS * 240}
        defaultProps={{
          lesson: null,
          timing: null,
          audioFileRelativePath: "media/knowledge-points/6030105-demo/lecture.mp3"
        } as TeacherBlackboardRemotionProps}
        calculateMetadata={sharedMetadata}
      />
      <Composition
        id="chicken-rabbit-lecture"
        component={ChickenRabbitRemotionVideo as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        fps={FPS}
        durationInFrames={FPS * 240}
        defaultProps={{
          lesson: null,
          timing: null,
          audioFileRelativePath: "media/knowledge-points/4030201-demo/lecture.mp3"
        } as ChickenRabbitRemotionProps}
        calculateMetadata={sharedMetadata}
      />
      <Composition
        id="sum-difference-lecture"
        component={SumDifferenceRemotionVideo as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        fps={FPS}
        durationInFrames={FPS * 240}
        defaultProps={{
          lesson: null,
          timing: null,
          audioFileRelativePath: "media/knowledge-points/3030101-demo/lecture.mp3"
        } as SumDifferenceRemotionProps}
        calculateMetadata={sharedMetadata}
      />
    </>
  );
};
