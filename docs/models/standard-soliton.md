# Standard soliton

[English](./standard-soliton.en.md)

## 仿真的方程

该模型是单场归一化 Lugiato-Lefever equation (LLE)。慢时间为 \(t\)，环向坐标为
\(\phi \in [-\pi,\pi)\)，相对模式编号为 \(\mu\)。仿真变量
\(\psi(\phi,t)\) 是腔内归一化场包络。

$$
\frac{\partial \psi}{\partial t}
=
\left[-(1+i\alpha)+iD_{\mathrm{int}}(\mu)+i|\psi|^2\right]\psi
+F+i\tau_R\psi\frac{\partial |\psi|^2}{\partial \phi}.
$$

色散算子在频域中定义为

$$
D_{\mathrm{int}}(\mu)
=
\frac{d_2\mu^2}{2}
+\frac{d_3\mu^3}{6}
+\frac{d_4\mu^4}{24}.
$$

这里 \(\alpha\) 是归一化泵浦失谐，\(F\) 是归一化泵浦幅度，
\(d_2,d_3,d_4\) 是归一化 integrated dispersion 系数，\(\tau_R\) 是
Raman shock 系数。当前实现使用一阶 split-step：先做时域 Kerr/Raman 更新，
再做频域线性传播，最后加入泵浦项。

## 物理图像

Standard soliton 对应异常色散微腔中的 bright dissipative Kerr soliton。腔损耗、
连续波泵浦、Kerr 非线性和色散共同决定稳态：泵浦补偿损耗，Kerr 非线性提供
强度相关相移，异常色散平衡非线性相移，从而形成窄的亮脉冲。

在时域图中，孤子表现为局域的高强度峰；在频域中，对应较宽且相干的 comb
spectrum。增大失谐通常会改变孤子宽度和峰值功率。非零 \(d_3\) 或 \(d_4\)
会打破简单二阶色散近似，并可能引入不对称谱或 dispersive-wave 特征。非零
\(\tau_R\) 会通过 \(i\tau_R\psi\partial_\phi|\psi|^2\) 改变非线性相位，
用于探索 Raman self-frequency-shift 类效应。

## Demo

1. 在 `MODEL` 中选择 `Standard soliton`。
2. 使用默认参数：`grid = 512`, `Detuning = 10`, `Pump power = 3.94`,
   `D2 = -0.0444`, `D3 = 0`, `D4 = 0`, `tauR = 0`。
3. 点击 `Play`。
4. 观察 `Temporal field` 中的局域亮脉冲，以及 `Comb spectrum` 中围绕泵浦模式的频谱。
5. 调节 `Detuning`，比较脉冲峰值、宽度和 `Intracavity energy` 的变化。
6. 将 `tauR` 从 0 缓慢增大，观察 Raman shock 项对脉冲和频谱的影响。

如果看到数值发散或频谱异常震荡，可以减小 `dt` 或降低 `Pump power`。求解器会根据
\(\max |D_{\mathrm{int}}|\,dt < \pi\) 自动限制过大的积分步长，以降低色散相位
aliasing 风险。

## 参考文献

- L. A. Lugiato and R. Lefever, "Spatial dissipative structures in passive optical systems," *Physical Review Letters* **58**, 2209 (1987).
- Y. K. Chembo and C. R. Menyuk, "Spatiotemporal Lugiato-Lefever formalism for Kerr-comb generation in whispering-gallery-mode resonators," *Physical Review A* **87**, 053852 (2013). <https://doi.org/10.1103/PhysRevA.87.053852>
