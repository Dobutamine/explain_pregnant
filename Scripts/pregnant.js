
// declare a object holding the neonatal model
pregnant = null

callback = () => {
    // set the datalogger interval
    pregnant.setDataloggerInterval(0.015);
    // set the models to watch
    pregnant.setDataloggerWatchedModels(['LA','LV','RA','RV','AA','VC'])
    // calculate 10 second of the model
    pregnant.calculateModel(10)
    // reset the callback
    resetCallback()
}



PregnantBuildAndGo()

function PregnantBuildAndGo() {

    console.log(`%cSCRIPT: running normal pregnancy script.`, "color:orange;")
    // load the normal_neonate model definition file into an instance of the model engine

    // prevent memory leak by terminating the worker and deleting the previous model object from memory
    if (pregnant !== null) {
        // terminate the worker thread otherwise it will linger in memory
        pregnant.engine.terminate()
        // delete the model instance from memory
        delete pregnant
    }
    
    pregnant = new Model('normal_pregnant')

    // wait a few seconds to complete
    pregnant.engine.addEventListener("message", (message) => {
        if (message.data.data[0] === 'ready') {
            callback()
        }
      });



}

function testKidneyFlow() {
    console.log('tyets kidney flow script')
    pregnant.setModelsToWatch
    pregnant.calculateModel(10)

}

function screenshot(chart = nonrt_chart1, filename = 'screenshot') {
    chart.saveToFile(filename)
}

function showPressure(model) {
    pregnant.setDataloggerInterval(0.0005)
    pregnant.setModelsToWatch(model)
    callback = () => {
        plotTimeChart(1, pregnant, model,['pres'],[1],["pressure in mmmhg"]);
    }
    pregnant.calculateModel(20)
}


function resetCallback() {
    callback = () => {}
}

