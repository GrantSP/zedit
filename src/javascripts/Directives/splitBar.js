ngapp.directive('splitBar', function () {
    return {
        restrict: 'E',
        template: '<div class="bar"></div>',
        scope: {
            offset: '=?',
            resizeCallback: '=?',
            mode: '=?'
        },
        link: function(scope, element) {
            angular.default(scope, 'offset', 0);
            angular.default(scope, 'mode', 0);
            angular.inherit(scope, '$index');

            // helper variables
            let htmlElement = document.documentElement,
                container = element[0].parentElement,
                scrollContainer = container.parentElement,
                vertical = container.classList.contains('vertical'),
                targetDimension = vertical ? 'height' : 'width',
                clientLabel = vertical ? 'clientY' : 'clientX',
                scrollLabel = vertical ? 'scrollTop' : 'scrollLeft',
                offsetLabel = vertical ? 'offsetTop' : 'offsetLeft',
                sizeLabel = vertical ? 'offsetHeight' : 'offsetWidth',
                cursorClass = vertical ? 'row-resize' : 'col-resize',
                moving = false;

            // event handlers
            let handleMouseMove = function(e) {
                let sizeElement = element[0].previousElementSibling,
                    localOffset = e[clientLabel] + scrollContainer[scrollLabel],
                    size = localOffset - sizeElement[offsetLabel] - container[offsetLabel],
                    ratio = size / (container[sizeLabel] - scope.offset),
                    width = scope.mode ? size + 'px' :  Math.min(ratio, 1.0).toPercentage(1);
                sizeElement.style[targetDimension] = width;
                scope.resizeCallback && scope.resizeCallback(scope.$index, width);
            };
            let handleMouseDown = function(e) {
                // only trigger when left mouse button is pressed
                if (e.button !== 0 && e.type !== 'touchstart') return;
                moving = true;
                htmlElement.className = cursorClass;
                htmlElement.addEventListener('mousemove', handleMouseMove);
                htmlElement.addEventListener('touchmove', handleMouseMove);
                e.preventDefault();
                e.stopImmediatePropagation();
            };
            let handleMouseUp = function(e) {
                if (!moving) return;
                moving = false;
                htmlElement.className = '';
                htmlElement.removeEventListener('mousemove', handleMouseMove);
                htmlElement.removeEventListener('touchmove', handleMouseMove);
                e.preventDefault();
                e.stopImmediatePropagation();
            };

            // event bindings
            element[0].addEventListener('mousedown', handleMouseDown);
            element[0].addEventListener('touchstart', handleMouseDown);
            htmlElement.addEventListener('mouseup', handleMouseUp);
            htmlElement.addEventListener('touchend', handleMouseUp);
            scope.$on('$destroy', function() {
                htmlElement.removeEventListener('mousemove', handleMouseMove);
                htmlElement.removeEventListener('touchmove', handleMouseMove);
                htmlElement.removeEventListener('mouseup', handleMouseUp);
                htmlElement.removeEventListener('touchend', handleMouseUp);
            });
        }
    }
});
