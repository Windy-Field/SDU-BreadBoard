// 根据两个角点返回规范矩形，反方向拖动时也保证宽高不为负数
export function selectionRectangle(first, last) {
    return {
        left: Math.min(first.x, last.x),
        top: Math.min(first.y, last.y),
        right: Math.max(first.x, last.x),
        bottom: Math.max(first.y, last.y)
    };
}

// 判断两个矩形是否接触或相交，用于选择芯片外壳
export function rectanglesIntersect(first, second) {
    return first.left <= second.right && first.right >= second.left &&
        first.top <= second.bottom && first.bottom >= second.top;
}

// 逐个坐标方向裁剪线段，只在实际线段经过矩形时命中，不用整根折线的外接框代替
export function segmentIntersectsRectangle(first, last, rectangle) {
    let start = 0;
    let end = 1;
    const directions = [
        { origin: first.x, distance: last.x - first.x, minimum: rectangle.left, maximum: rectangle.right },
        { origin: first.y, distance: last.y - first.y, minimum: rectangle.top, maximum: rectangle.bottom }
    ];
    for (const direction of directions) {
        if (direction.distance === 0) {
            if (direction.origin < direction.minimum || direction.origin > direction.maximum) {
                return false;
            }
            continue;
        }
        const firstCrossing = (direction.minimum - direction.origin) / direction.distance;
        const lastCrossing = (direction.maximum - direction.origin) / direction.distance;
        start = Math.max(start, Math.min(firstCrossing, lastCrossing));
        end = Math.min(end, Math.max(firstCrossing, lastCrossing));
        if (start > end) {
            return false;
        }
    }
    return true;
}

// 检查折线的每一段，任意一段接触选框就返回命中
export function pathIntersectsRectangle(points, rectangle) {
    for (let index = 1; index < points.length; index = index + 1) {
        if (segmentIntersectsRectangle(points[index - 1], points[index], rectangle)) {
            return true;
        }
    }
    return false;
}
