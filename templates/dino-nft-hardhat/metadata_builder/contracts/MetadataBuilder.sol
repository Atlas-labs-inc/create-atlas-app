//SPDX-License-Identifier: MIT
/// @author Cliff Syner / Alpine
pragma solidity ^0.8.0;

import "./ContractUtil.sol";

library MetadataBuilder{
    //Display Types on OpenSea
    enum DisplayOptions{
        STANDARD,
        BOOST_NUMBER,
        BOOST_PERCENTAGE,
        NUMBER
    }
    //Metadata JSON Display Option Strings
    bytes constant STANDARD = '""';
    bytes constant BOOSTN = '"boost_number"';
    bytes constant BOOSTP = '"boost_percentage"';
    bytes constant NUM = '"number"';

    function initMetadata(
        string memory name,
        string memory description,
        string memory image,
        string memory external_url
    ) internal pure returns(bytes memory){
        return abi.encodePacked(
            '{',
            '"description":"', description,
            '","external_url":"', external_url,
            '","image":"', image,
            '","name":"', name, 
            '","attributes":['
        );
    }

    function _getDisplay(DisplayOptions displayType) internal pure returns(bytes memory){
        if(displayType == DisplayOptions.NUMBER){
            return NUM;
        }
        if(displayType == DisplayOptions.BOOST_PERCENTAGE){
            return BOOSTP;
        }
        if(displayType == DisplayOptions.BOOST_NUMBER){
            return BOOSTN;
        }
        return STANDARD;
    }

    /// @dev General Attribute addition functions

    function addIntegerAttributes(DisplayOptions displayType, string[] memory names, uint[] memory values) internal pure returns(bytes memory){
        // names.length and values.length must be equal
        bytes memory _display = _getDisplay(displayType);
        bytes memory _resp;
        for(uint i = 0; i < names.length; i++){
            _resp = bytes.concat(
                _resp,
                '{',
                '"display_type":', _display, ',',
                '"trait_type":"', bytes(names[i]),'",',
                '"value":', bytes(ContractUtil.uintString(values[i])),
                '}', ','
            );
        }
        return _resp;
    }

    function addIntegerAttributesConstantMaxValue(DisplayOptions displayType, string[] memory names, uint[] memory values, uint max_value) internal pure returns(bytes memory){
        // names.length and values.length must be equal
        bytes memory _display = _getDisplay(displayType);
        bytes memory _resp;
        for(uint i = 0; i < names.length; i++){
            _resp = bytes.concat(
                _resp,
                '{',
                '"display_type":', _display, ',',
                '"trait_type":"', bytes(names[i]),'",',
                '"value":', bytes(ContractUtil.uintString(values[i])),',',
                '"max_value":', bytes(ContractUtil.uintString(max_value)),
                '}', ','
            );
        }
        return _resp;
    }

    function addAttributes(string[] memory names, string[] memory values) internal pure returns(bytes memory){
        // names.length and values.length must be equal
        bytes memory _resp;
        for(uint i = 0; i < names.length; i++){
            _resp = bytes.concat(
                _resp,
                '{',
                '"trait_type":"', bytes(names[i]),'",',
                '"value":"', bytes(values[i]), '"',
                '}', ','
            );
        }
        return _resp;
    }

    /// @dev To remove unnecessary code to convert static arrays to dynamic ones: overload attribute functions here
    
    function addIntegerAttributesConstantMaxValue(DisplayOptions displayType, string[8] memory names, uint[8] memory values, uint max_value) internal pure returns(bytes memory){
        // names.length and values.length must be equal
        bytes memory _display = _getDisplay(displayType);
        bytes memory _resp;
        for(uint i = 0; i < names.length; i++){
            _resp = bytes.concat(
                _resp,
                '{',
                '"display_type":', _display, ',',
                '"trait_type":"', bytes(names[i]),'",',
                '"value":', bytes(ContractUtil.uintString(values[i])),',',
                '"max_value":', bytes(ContractUtil.uintString(max_value)),
                '}', ','
            );
        }
        return _resp;
    }


    function addAttributes(string[11] memory names, string[11] memory values) internal pure returns(bytes memory){
        // names.length and values.length must be equal
        bytes memory _resp;
        for(uint i = 0; i < names.length; i++){
            _resp = bytes.concat(
                _resp,
                '{',
                '"trait_type":"', bytes(names[i]),'",',
                '"value":"', bytes(values[i]), '"',
                '}', ','
            );
        }
        return _resp;
    }

    function addAttributes(string[2] memory names, string[2] memory values) internal pure returns(bytes memory){
        // names.length and values.length must be equal
        bytes memory _resp;
        for(uint i = 0; i < names.length; i++){
            _resp = bytes.concat(
                _resp,
                '{',
                '"trait_type":"', bytes(names[i]),'",',
                '"value":"', bytes(values[i]), '"',
                '}', ','
            );
        }
        return _resp;
    }
    

    function finalizeMetadata(bytes memory metadataRaw) internal pure returns(bytes memory){
        bytes memory result = new bytes(metadataRaw.length-1);
        for(uint i = 0; i < metadataRaw.length-1; i++) {
            result[i] = metadataRaw[i];
        }
        return bytes.concat(
            result,
            ']','}'
        );
    }

    function finalizeSimpleMetadata(bytes memory metadata) internal pure returns(string memory){
        return string(
            abi.encodePacked(
                'data:application/json;base64,',
                ContractUtil.b64Encode(
                    bytes.concat(metadata, ']}')
                )
            )
        );
    }

}