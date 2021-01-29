
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
    // load the normal_pregnant model definition file into an instance of the model engine

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

function StartPregnant(){
 
    pregnant.setDataloggerWatchedModels(['AR','KID','VR','AR_KID','KID_VR','AA','LV_AA','kidneys','VC']); 
}

function screenshot(chart = nonrt_chart1, filename = 'screenshot') {
    chart.saveToFile(filename)
}

function showPressure(model) {
    pregnant.setDataloggerInterval(0.0005)
    pregnant.setDataloggerWatchedModels([model])
    callback = () => {
        plotTimeChart(1, pregnant, [model],['pres'],[1],["pressure in mmmhg"]);
    }
    pregnant.calculateModel(20)
}

function showFlow(model) {
    pregnant.setDataloggerInterval(0.0005)
    pregnant.setDataloggerWatchedModels([model])
    callback = () => {
        plotTimeChart(1, pregnant, [model],['real_flow'],[60],["flow L/min"]);
    }
    pregnant.calculateModel(20)
}

function resetCallback() {
    callback = () => {}
}

function calcPres(model, chart = 1, duration = 30, logger_interval = 0.0005, min = null, max = null) {
    pregnant.setDataloggerInterval(logger_interval)
    pregnant.setDataloggerWatchedModels([model])
    callback = () => {
        let max_pres = -1000
        let min_pres = 1000
        pregnant.data.forEach(dataline => {
            if (dataline[model].pres != 'undefined')
            {
                if (dataline[model].pres > max_pres){
                    max_pres = dataline[model].pres
                }
                if (dataline[model].pres < min_pres){
                    min_pres = dataline[model].pres
                }
            }  
        })
        let mean = Math.round(((2 * min_pres) + max_pres) / 3)
        let systole = Math.round(max_pres)
        let diastole = Math.round(min_pres)
        let pres_mes = `pressures of ${model} : ${systole}/${diastole} (${mean}) mmHg`
        console.log(pres_mes)
        plotTimeChart(chart, pregnant, [model],['pres'],[1,1],[pres_mes], min, max);

    }
    pregnant.calculateModel(duration)
}

function calcFlow(model, chart = 1, duration = 60, logger_interval = 0.0005, min = null, max = null) {
    pregnant.setDataloggerInterval(logger_interval)
    pregnant.setDataloggerWatchedModels([model, "ecg"])
    callback = () => {
        let total_flow = 0
        let stroke_volume_cum = 0
        let stroke_volume = 0
        let temp_stroke_volume = 0
        let no_heartbeats = 0
        pregnant.data.forEach(dataline => {
            if (dataline.ecg.ncc_ventricular === 1){
               
                no_heartbeats += 1
                stroke_volume = temp_stroke_volume       
                temp_stroke_volume = 0
            }
            dataline[model]["sv"] = stroke_volume
            temp_stroke_volume += dataline[model].real_flow * 1000 * 0.0005
            stroke_volume_cum += dataline[model].real_flow * 1000 * 0.0005
            total_flow += dataline[model].real_flow
        })
        let avg_flow = ((total_flow / pregnant.data.length) * 60).toFixed(3);  
        let avg_sv  = (stroke_volume_cum / no_heartbeats ).toFixed(2)
        
        console.log(`${model} : avg flow ${avg_flow} l/min`)
        
    }
    pregnant.calculateModel(duration)
}
//plotTimeChart(chart, pregnant, [model, model],['real_flow'],[60],[`${model} : avg flow ${avg_flow} l/min`], min, max);
