import { lib } from './lib';
import { Fail, GetHandle, GetString, GetInteger, wcb } from './helpers';

// FILE HANDLING METHODS
Object.assign(xelib, {
    AddFile: function(filename) {
        return GetHandle(function(_res) {
            if (!lib.AddFile(wcb(filename), _res))
                Fail(`Failed to add new file: ${filename}`);
        });
    },
    FileByIndex: function(index) {
        return GetHandle((_res) => lib.FileByIndex(index, _res));
    },
    FileByLoadOrder: function(loadOrder) {
        return GetHandle((_res) => lib.FileByLoadOrder(loadOrder, _res));
    },
    FileByName: function(filename) {
        return GetHandle((_res) => lib.FileByName(wcb(filename), _res));
    },
    FileByAuthor: function(author) {
        return GetHandle((_res) => lib.FileByAuthor(wcb(author), _res));
    },
    NukeFile: function(_id) {
        if (!lib.NukeFile(_id))
            Fail(`Failed to nuke file: ${_id}`);
    },
    RenameFile: function(_id, newFileName) {
        if (!lib.RenameFile(_id, wcb(newFileName)))
            Fail(`Failed to rename file to ${newFileName}`);
    },
    SaveFile: function(_id, filePath = '') {
        if (!lib.SaveFile(_id, wcb(filePath)))
            Fail(`Failed to save file: ${_id}`);
    },
    GetOverrideRecordCount: function(_id) {
        return GetInteger(function(_res) {
            if (!lib.GetOverrideRecordCount(_id, _res))
                Fail(`Failed to get override record count for: ${_id}`);
        });
    },
    GetRecordCount: function(_id) {
        return GetInteger(function(_res) {
            if (!lib.GetRecordCount(_id, _res))
                Fail(`Failed to get record count for: ${_id}`);
        });
    },
    MD5Hash: function(_id) {
        return GetString(function(_len) {
            if (!lib.MD5Hash(_id, _len))
                Fail(`Failed to get MD5 Hash for: ${_id}`);
        });
    },
    CRCHash: function(_id) {
        return GetString(function(_len) {
            if (!lib.CRCHash(_id, _len))
                Fail(`Failed to get CRC Hash for: ${_id}`);
        });
    },
    GetFileLoadOrder: function(_id) {
        return GetInteger(function(_res) {
            if (!lib.GetFileLoadOrder(_id, _res))
                Fail(`Failed to file load order for: ${_id}`);
        });
    },
    GetFileHeader: function(_id) {
        return xelib.GetElement(_id, 'File Header');
    }
});
