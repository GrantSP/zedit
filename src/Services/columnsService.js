export default function(ngapp, fileHelpers, xelib) {
    ngapp.service('columnsService', function(xelibService) {
        var service = this;

        var formIDColumn = {
            label: "FormID",
            canSort: true,
            getData: function (node) {
                switch (node.element_type) {
                    case xelib.etFile:
                        return xelib.DisplayName(node.handle);
                    case xelib.etGroupRecord:
                        // TODO: include signature as well based on setting
                        return xelib.Name(node.handle);
                    case xelib.etMainRecord:
                        if (node.fid == 0) {
                            return 'File Header';
                        } else {
                            return xelibService.intToHex(node.fid, 8);
                        }
                }
            }
        };
        var editorIDColumn = {
            label: "EditorID",
            canSort: true,
            getData: function(node) {
                if (node.element_type === xelib.etMainRecord && node.fid > 0) {
                    return xelib.EditorID(node.handle, true);
                }
            }
        };
        var nameColumn = {
            label: "Name",
            canSort: true,
            getData: function(node) {
                if (node.element_type === xelib.etMainRecord && node.fid > 0) {
                    return xelib.FullName(node.handle, true);
                }
            }
        };

        this.addColumn = function(column) {
            column.canSort = false;
            eval(`column.getData = function(node){${column.getDataCode}}`);
            service.columns.push(column);
        };

        this.activeColumns = function() {
            return service.columns.filter(function(column) {
                return column.enabled;
            }).map(function(column) {
                return {
                    label: column.label,
                    width: column.width
                };
            });
        };

        this.customColumns = function() {
            return service.columns.filter(function(column) {
                return column.custom;
            }).map(function(column) {
                return {
                    label: column.label,
                    getDataCode: column.getDataCode
                };
            });
        };

        this.saveColumns = function() {
            let data = {
                activeColumns: service.activeColumns(),
                customColumns: service.customColumns()
            };
            fileHelpers.saveJsonFile('columns.json', data);
        };

        this.setColumnData = function(columnData) {
            let column = service.columns.find(function(column) {
                return column.label === columnData.label;
            });
            if (column) {
                column.width = columnData.width;
                column.enabled = true;
            }
        };

        var defaultColumnsConfig = {
            customColumns: [],
            activeColumns: [{
                label: 'FormID',
                width: '40%'
            }, {
                label: 'EditorID',
                width: '25%'
            }, {
                label: 'Name'
            }]
        };

        this.loadColumns = function() {
            let data = fileHelpers.loadJsonFile('columns.json', defaultColumnsConfig);
            service.columns = [formIDColumn, editorIDColumn, nameColumn];
            data.customColumns.forEach((column) => service.addColumn(column));
            data.activeColumns.forEach((column) => service.setColumnData(column));
        };

        // load columns immediately upon service initialization
        service.loadColumns();
    });
};