import React from 'react';
import {scanPlans, plan, streamProps } from 'react-streams';
import { from, merge, of, pipe } from 'rxjs';
import { map, mergeScan, scan, switchMap} from 'rxjs/operators';

const inputNumAs = key => pipe(
    map(e=>({[key] : Number(e.target.value)}))
);
const StepperControl = streamProps(
    switchMap(({min,max,step})=>{
        const onUpdateMin = plan(inputNumAs('min'))
        const onUpdateMax = plan(inputNumAs('max'))
        const onUpdateStep = plan(inputNumAs('step'))

        const props$ = of({
            min, max,step, onUpdateMin,onUpdateMax,onUpdateStep
        })
        return merge(
            props$,
            from(onUpdateMax),
            from(onUpdateMin),
            from(onUpdateStep)
        ).pipe(
            scan(({max,min,step},next) => {
                const diff = max - min
                const updateStep = (step,diff) => 
                    step === diff && diff > 1 ? step -1 :step
                
                if (next.min) {
                    return{
                        min: next.min >= max ? min : next.min,
                        max,
                        step                        
                    }
                }
                if (next.max) {
                    return{
                        min,
                        max: next.max <= min ? max : next.max,
                        step: updateStep(step,diff)                   
                    }
                }
                if (next.step) {
                    return{
                        min,
                        max,
                        step: next.step === max - min + 1 ? step : next.step                   
                    }
                }
                return{
                    min,max,step
                }

            })
        )
    })
);
const Stepper = streamProps(
    mergeScan((prevProps,{min,max,step, defaultValue}) => {
        // console.table({
        //     props,
        //     prevProps,
        //     nextProps: {min,max,step,defaultValue}
        // })
        const onDec = plan(
            map(()=>({value})=>({
                value: value - step < min ?value : value - step
            }))
        )
        const onInc = plan(
            map(()=>({value})=>({
                value: value + step > max ? value : value + step
            }))
        )
        const onChange = plan(
            map(e => Number(e.target.value)),
            map(value => () =>({value}))
        )
        const onBlur = plan(
            map(e=>Number(e.target.value)),
            map(({value})=> ({
                value:Math.min(max, Math.max(min,max))
            }))
        )
        const value = prevProps 
        ? Math.max(min,Math.min(max,prevProps.value))
        : defaultValue;

        return of({
            value,
            min,
            max,step
        }).pipe(
            scanPlans({
                onDec,
                onInc,
                onChange,
                onBlur
            })
        )

    }
)
)
const StepperModule = () => {
    return(
        <StepperControl min={10} max={20} step={1}>
            {
                ({min,max,step,onUpdateMin,onUpdateMax,onUpdateStep})=>(
                    <div style={{ padding: "2rem" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                        <label>
                            min: <input type="number" value={min} onChange={onUpdateMin} />
                        </label>
                        <label>
                            max: <input type="number" value={max} onChange={onUpdateMax} />
                        </label>
                        <label>
                            step: <input type="number" value={step} onChange={onUpdateStep} />
                        </label>
                        </div>
                        <Stepper defaultValue={10} min={min} max={max} step={step}>
                            {
                                ({onDec,onInc,onChange,onBlur,value,min,max,step}) => (
                                    <div>
                                        <button onClick={onDec} aria-label="Decrement value">
                                            -
                                        </button>
                                        <input
                                            style={{ width: "2rem" }}
                                            value={value}
                                            onBlur={onBlur}
                                            onChange={onChange}
                                            type="text"
                                            aria-label="Set value"
                                        />
                                        <button onClick={onInc} aria-label="Increment value">
                                            +
                                        </button>
                                        <br />

                                        <input
                                            type="range"
                                            min={min}
                                            max={max}
                                            step={step}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    </div>
                                )
                            }

                        </Stepper>
                    </div>
                )
            }
        </StepperControl>
    )
}
export default StepperModule;