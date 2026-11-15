import test from "node:test";
import assert from "node:assert/strict";
import { selectionRectangle, rectanglesIntersect, segmentIntersectsRectangle, pathIntersectsRectangle } from "../src/selection-geometry.mjs";

// 反向拖动得到相同矩形，接触边界也能选中芯片
function testSelectionRectangle() {
    const area = selectionRectangle({ x: 40, y: 60 }, { x: 10, y: 20 });
    assert.deepEqual(area, { left: 10, top: 20, right: 40, bottom: 60 });
    assert.equal(rectanglesIntersect(area, { left: 40, top: 30, right: 80, bottom: 70 }), true);
    assert.equal(rectanglesIntersect(area, { left: 41, top: 30, right: 80, bottom: 70 }), false);
}

// 水平、竖直、斜线、零长度和折线空白处都按实际线段判断
function testSelectionPaths() {
    const area = { left: 10, top: 10, right: 20, bottom: 20 };
    assert.equal(segmentIntersectsRectangle({ x: 0, y: 15 }, { x: 30, y: 15 }, area), true);
    assert.equal(segmentIntersectsRectangle({ x: 15, y: 30 }, { x: 15, y: 0 }, area), true);
    assert.equal(segmentIntersectsRectangle({ x: 0, y: 0 }, { x: 30, y: 30 }, area), true);
    assert.equal(segmentIntersectsRectangle({ x: 0, y: 15 }, { x: 15, y: 0 }, area), false);
    assert.equal(segmentIntersectsRectangle({ x: 15, y: 15 }, { x: 15, y: 15 }, area), true);
    assert.equal(segmentIntersectsRectangle({ x: 0, y: 0 }, { x: 0, y: 0 }, area), false);
    const points = [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 30 }];
    assert.equal(pathIntersectsRectangle(points, area), false);
}

test("选框支持反向拖动与矩形边界接触", testSelectionRectangle);
test("框选只命中实际导线段而非折线外接框", testSelectionPaths);
