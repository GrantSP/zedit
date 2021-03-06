ngapp.controller('editValueModalController', function($scope, $timeout, errorService, modalService) {
    // variables
    let opts = $scope.modalOptions,
        node = opts.targetNode,
        handle = node.handles[opts.targetIndex],
        value = node.cells[opts.targetIndex + 1].value,
        vtLabel = xelib.valueTypes[node.value_type];

    xelib.valueTypes.forEach((key, index) => $scope[key] = index);
    $scope.path = xelib.Path(handle);
    $scope.vtClass = vtLabel;
    $scope.valueType = node.value_type;

    let tryParseColor = function(color) {
        try { return new Color(color) } catch (e) {}
    };

    // inherited functions
    modalService.buildUnfocusModalFunction($scope);

    // scope functions
    $scope.applyValue = function() {
        if ($scope.invalid) return;
        errorService.try(function() {
            xelib.SetValue(handle, '', $scope.value);
            $scope.afterApplyValue();
        });
    };

    $scope.afterApplyValue = function() {
        let index = opts.targetIndex,
            record = index === 0 ? opts.record : opts.overrides[index - 1];
        $scope.$root.$broadcast('recordUpdated', record);
        $scope.$emit('closeModal');
    };

    $scope.setupBytes = function(value) {
        let isHexKey = function(key) {
            return (key > 47 && key < 58) || (key > 64 && key < 71);
        };

        let isPrintable = function(key) {
            return key > 33 && key !== 127;
        };

        let bytesToStr = function(bytes) {
            let a = bytes.map((byte) => { return parseInt(byte, 16); });
            return a.reduce(function(str, byte) {
                return str + (isPrintable(byte) ? String.fromCharCode(byte) : '.');
            }, '');
        };

        $scope.applyValue = function() {
            errorService.try(function() {
                xelib.SetValue(handle, '', $scope.bytes.join(' '));
                $scope.afterApplyValue();
            });
        };

        $scope.onByteKeyDown = function(e, index) {
            if (!isHexKey(e.keyCode)) return;
            let newChar = String.fromCharCode(e.keyCode).toUpperCase(),
                byte = $scope.bytes[index];
            if (byte[1] === ' ') {
                $scope.bytes[index] = byte[0] + newChar;
                $scope.text = bytesToStr($scope.bytes);
                let nextSpan = e.srcElement.nextElementSibling;
                if (nextSpan) {
                    nextSpan.focus();
                } else {
                    e.srcElement.blur();
                }
            } else {
                $scope.bytes[index] = newChar + ' ';
            }
        };

        $scope.onByteBlur = function(index) {
            let byte = $scope.bytes[index];
            if (byte[1] === ' ') {
                $scope.bytes[index] = '0' + byte[0];
                $scope.text = bytesToStr($scope.bytes);
            }
        };

        $scope.bytes = value.split(' ');
        $scope.text = bytesToStr($scope.bytes);
    };

    $scope.setupNumber = function(value) {
        $scope.textChanged = function() {
            let match = /^\-?([0-9]+)(\.[0-9]+)?$/i.exec($scope.value);
            $scope.invalid = !match;
        };
        $scope.value = value;
        $scope.textChanged();
    };

    $scope.setupText = function(value) {
      const htmlElements = ['DESC - Book Text'];
      $scope.useHtmlEditor = htmlElements.includes(node.label);
      $scope.value = value;
    };


    $scope.setupReference = function(value) {
        $scope.signatures = xelib.GetAllowedSignatures(handle).sort();
        $scope.signature = $scope.signatures[0];
        $scope.referenceSearch = function(str) {
            return xelib.FindValidReferences(handle, $scope.signature, str, 10);
        };
        $scope.setCustomResult = (str) => $scope.value = str;
        $scope.value = value;
    };

    $scope.setupFlags = function(value) {
        $scope.applyValue = function() {
            let activeFlags = $scope.flags.filter((flag) => { return flag.active; });
            $scope.value = activeFlags.map((flag) => { return flag.name; });
            xelib.SetEnabledFlags(handle, '', $scope.value);
            $scope.afterApplyValue();
        };

        // initialize flags
        $scope.defaultAction = $scope.applyValue;
        let enabledFlags = value.split(', ');
        $scope.flags = xelib.GetAllFlags(handle).map(function(flag) {
            return {
                name: flag,
                active: flag !== '' && enabledFlags.includes(flag)
            }
        });
    };

    $scope.setupEnum = function(value) {
        $scope.options = xelib.GetEnumOptions(handle);
        $scope.value = value;
    };

    $scope.setupColor = function() {
        $scope.textChanged = function() {
            let c = tryParseColor($scope.value);
            $scope.invalid = !c;
            if (!$scope.invalid) {
                $scope.color = c.toHex();
                $scope.colorStyle = {'background-color': `${$scope.value}`};
            }
        };

        $scope.applyValue = function() {
            if ($scope.invalid) return;
            errorService.try(function() {
                let c = tryParseColor($scope.value);
                xelib.SetValue(handle, 'Red', c.getRed().toString());
                xelib.SetValue(handle, 'Green', c.getGreen().toString());
                xelib.SetValue(handle, 'Blue', c.getBlue().toString());
                $scope.afterApplyValue();
            });
        };

        $scope.$watch('color', function() {
            let c = new Color($scope.color);
            $scope.value = c.toRGB();
            $scope.colorStyle = {'background-color': `${$scope.value}`};
        });

        // initialize color
        let red = xelib.GetValueEx(handle, 'Red'),
            green = xelib.GetValueEx(handle, 'Green'),
            blue = xelib.GetValueEx(handle, 'Blue');
        $scope.value = `rgb(${red}, ${green}, ${blue})`;
        $scope.textChanged();
    };

    // initialization
    let setupFunctions = {
        vtBytes: $scope.setupBytes,
        vtNumber: $scope.setupNumber,
        vtReference: $scope.setupReference,
        vtFlags: $scope.setupFlags,
        vtEnum: $scope.setupEnum,
        vtColor: $scope.setupColor,
        vtText: $scope.setupText
    };

    if (setupFunctions.hasOwnProperty(vtLabel)) {
        setupFunctions[vtLabel](value);
    } else {
        $scope.value = value;
    }
});
