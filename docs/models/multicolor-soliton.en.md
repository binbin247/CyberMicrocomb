# Multicolor soliton

[中文](./multicolor-soliton.md)

## Simulation Equations

This model follows supplementary Eqs. S1-S3 of *Multicolor interband solitons in
microcombs*. It uses three fields: primary $E_p(\phi,t)$, signal $E_s(\phi,t)$,
and idler $E_i(\phi,t)$. The browser implementation uses a loss-normalized form.

The normalized model keeps self-phase modulation, cross-phase modulation,
four-wave mixing, FSR mismatch, and the primary pump:

$$
\frac{\partial E_p}{\partial t}
=-(1+i\alpha_p)E_p
+i\frac{d_{2p}}{2}\frac{\partial^2 E_p}{\partial\phi^2}
+i\left(|E_p|^2+2\eta |E_s|^2+2\eta |E_i|^2\right)E_p
+2i\gamma E_sE_iE_p^*
+F ,
$$

$$
\frac{\partial E_s}{\partial t}
=-\Delta_s\frac{\partial E_s}{\partial\phi}
-(1+i\alpha_s)E_s
+i\frac{d_{2s}}{2}\frac{\partial^2 E_s}{\partial\phi^2}
+i\left(|E_s|^2+2\eta |E_p|^2+2\eta |E_i|^2\right)E_s
+i\gamma E_p^2E_i^* ,
$$

$$
\frac{\partial E_i}{\partial t}
=-\Delta_i\frac{\partial E_i}{\partial\phi}
-(1+i\alpha_i)E_i
+i\frac{d_{2i}}{2}\frac{\partial^2 E_i}{\partial\phi^2}
+i\left(|E_i|^2+2\eta |E_p|^2+2\eta |E_s|^2\right)E_i
+i\gamma E_p^2E_s^* .
$$

$\eta$ is the XPM coefficient, $\gamma$ is the FWM coupling coefficient, and
$\Delta_s,\Delta_i$ are the signal/idler FSR mismatch terms relative to the
primary family. The defaults are loss-normalized estimates from the supplementary
simulation parameters.

## Physical Picture

A primary soliton can coherently drive other mode families through Kerr nonlinear
interactions. When the signal and idler dispersion, detuning, and group-velocity
conditions are favorable, FWM creates secondary color pulses that overlap the
primary pulse in time. The result is a coupled soliton state whose constituent
colors share the same repetition rate.

Read the panels as follows:

- `Temporal field`: check whether primary, signal, and idler pulses overlap in $\phi$.
- `Comb spectrum`: compare bandwidth, spectral peaks, and relative intensity.
- `Intracavity energy`: see whether the three fields build up and stabilize.
- `Temporal evolution`: check synchronization, drift, breakup, or instability.

## Demo

1. Select `Multicolor soliton` in `MODEL`.
2. Keep the defaults: `grid = 1024` and the normalized values derived from the
   supplementary simulation parameters.
3. Click `Play` and first check whether the primary field forms a localized pulse.
4. Continue running and watch whether signal and idler grow and overlap the primary pulse.
5. Scan `alphaP` to find primary-only, secondary-growth, and stable three-color regimes.
6. Scan `fsrMismatchI` or `fwmRe` to test phase matching.

This is a reduced coupled-LLE demo. It does not include thermal tuning, full
mode-family hybridization, or absolute power calibration.

## References

- Q.-X. Ji et al., "Multicolor interband solitons in microcombs," *Light: Science & Applications* **15**, 166 (2026). [https://doi.org/10.1038/s41377-026-02200-0](https://doi.org/10.1038/s41377-026-02200-0)
- Supplementary information for "Multicolor interband solitons in microcombs," especially Eqs. S1-S3 and the listed simulation parameters.
