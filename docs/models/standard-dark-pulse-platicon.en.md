# Standard dark pulse (platicon)

[中文](./standard-dark-pulse-platicon.md)

## Simulation equations

This model is a normal-dispersion single-field LLE with a local mode shift applied
to one selected comb mode. The field variables follow the same convention as in
`Standard soliton`.

$$
\frac{\partial \psi}{\partial t}
=
\left[-(1+i\alpha)+iD_{\mathrm{int}}(\mu)+i|\psi|^2\right]\psi+F.
$$

The dispersion contains a quadratic term and a single-mode perturbation:

$$
D_{\mathrm{int}}(\mu)
=
\frac{d_2\mu^2}{2}
+\Delta_{\mathrm{shift}}\delta_{\mu,\mu_{\mathrm{shift}}}.
$$

Here \(d_2>0\) is normal dispersion in the current normalized convention,
\(\mu_{\mathrm{shift}}\) is the shifted relative mode number, and
\(\Delta_{\mathrm{shift}}\) is the mode-shift strength normalized to
\(\kappa/2\). The implementation shifts one integer mode only; it does not
automatically apply a symmetric shift to \(\pm\mu\).

## Physical picture

In normal dispersion, the usual bright soliton is not the natural stable state.
The system can instead form a flat-top dark pulse, or platicon, through switching
fronts between two cw backgrounds. A local mode shift changes the effective
integrated dispersion of one mode, similar to a mode interaction, and can help
the system access a platicon state.

In the temporal plot, a platicon often appears as a broad dark notch or flat-top
switching-front structure on a high background. In the frequency domain it forms
a normal-dispersion comb. `Mode shift position` sets which comb mode is perturbed,
while `Mode shift strength` sets the perturbation amplitude. A weak perturbation
may fail to trigger a stable dark pulse, while an overly strong perturbation can
produce irregular spectra or temporal patterns.

## Demo

1. Select `Standard dark pulse (platicon)` in `MODEL`.
2. Use the defaults: `grid = 512`, `Detuning = 4`, `Pump power = 3.94`,
   `D2 = 0.02`, `Mode shift position = 0`, `Mode shift strength = 4`.
3. Click `Play`.
4. Look for a dark notch or flat-top structure in `Temporal field`.
5. Keep `D2 > 0` and scan `Mode shift strength` to compare dark-pulse depth and
   stability.
6. Change `Mode shift position` to see how the perturbed mode affects the comb
   spectrum.

This model intentionally omits Raman, \(d_3\), and \(d_4\) terms so the role of
normal dispersion and local mode perturbation is clear.

## References

- V. E. Lobanov, G. Lihachev, T. J. Kippenberg, and M. L. Gorodetsky, "Frequency combs and platicons in optical microresonators with normal GVD," *Optics Express* **23**, 7713 (2015). <https://doi.org/10.1364/OE.23.007713>
- "Platicon microcomb generation using pump and additional mode perturbation," *Communications Physics* (2023). <https://www.nature.com/articles/s42005-023-01424-5>
