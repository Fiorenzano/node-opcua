"use strict";
/* global describe,it,before*/
var constructNodesetFilename = require("node-opcua-nodesets").constructNodesetFilename;
var generateAddressSpace = require("node-opcua-address-space-loader").generate_address_space;
var AddressSpace = require("..").AddressSpace;
var createBoilerType = require("../test_helpers/boiler_system").createBoilerType;

var describe = require("node-opcua-test-helpers/src/resource_leak_detector").describeWithLeakDetector;
describe("Testing automatic string nodeid assignment", function () {


    var nodesetFilename = constructNodesetFilename("Opc.Ua.NodeSet2.xml");


    var addressSpace = null;
    var boilerType = null;
    before(function (done) {
        addressSpace = new AddressSpace();
        generateAddressSpace(addressSpace, nodesetFilename, function () {
            boilerType = createBoilerType(addressSpace);
            done();
        });
    });
    after(function (done) {
        if (addressSpace) {
            addressSpace.dispose();
            addressSpace = null;
        }
        done();
    });

    it("should automatically assign string nodeId in same namespace as parent object", function () {


        var boiler = boilerType.instantiate({
            browseName: "Boiler#1",
            nodeId: "ns=36;s=MyBoiler"
        });

        boiler.nodeId.toString().should.eql("ns=36;s=MyBoiler");

        boiler.pipeX001.nodeId.namespace.should.eql(boiler.nodeId.namespace, "expecting namespace index to match");
        boiler.pipeX001.nodeId.toString().should.eql("ns=36;s=MyBoiler-PipeX001");

        //  console.log(boiler.toString());

    });

    it("should be possible to specify a custom separator for construction string nodeid during object instantiation", function () {


        var old_nodeIdNameSeparator = AddressSpace.nodeIdNameSeparator;

        AddressSpace.nodeIdNameSeparator = "#";

        var boiler = boilerType.instantiate({
            browseName: "Boiler2",
            nodeId: "ns=36;s=MyBoiler2"
        });

        boiler.nodeId.toString().should.eql("ns=36;s=MyBoiler2");

        boiler.pipeX001.nodeId.namespace.should.eql(boiler.nodeId.namespace, "expecting namespace index to match");
        boiler.pipeX001.nodeId.toString().should.eql("ns=36;s=MyBoiler2#PipeX001");

        AddressSpace.nodeIdNameSeparator = old_nodeIdNameSeparator;

    });

});
