import numpy as np
from scipy.optimize import curve_fit
import math

def arps_equation(t, qi, Di, b):
    return qi / (1 + b * Di * t)**(1/b)

def fit_decline_curve(production_data):
    oil_values = [record.oil for record in production_data]
    gas_values = [record.gas for record in production_data]
    water_values = [record.water for record in production_data]

    time_steps = list(range(len(production_data)))

    oil_params, _ = curve_fit(arps_equation, time_steps, oil_values)
    qio, Dio, bo = oil_params

    gas_params, _ = curve_fit(arps_equation, time_steps, gas_values)
    qig, Dig, bg = gas_params

    water_params, _ = curve_fit(arps_equation, time_steps, water_values)
    qiw, Diw, bw = water_params

    return {
        "oil": [qio, Dio, bo],
        "gas": [qig, Dig, bg],
        "water": [qiw, Diw, bw]
    }

def forecast_production(qi, Di, b, months=12):
    plot_values = []
    for i in range (1, months+1):
        plot_values.append(arps_equation(i, qi, Di, b))
    
